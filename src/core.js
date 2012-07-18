var scheme = (function(scheme) {
    var readMacros = {
        "if": function(env, _, test, consequence, alternative) {
            return eval(eval(test, env) ? consequence : alternative, env);
        },
        "define": function(env, _, first, second) {
            if (!scheme.utils.isArray(first)) {
                env.define(first, eval(second, env));
                return;
            }
            var name = first[0],
                args = first.slice(1),
                body = [new scheme.Symbol("begin")]
                    .concat(Array.prototype.slice.call(arguments, 3));
            env.define(name, readMacros["lambda"](env, _, args, body));
        },
        "set!": function(env, _, variable, value) {
            if (variable instanceof scheme.Symbol) {
                var name = variable.toString();
                if (typeof env.get(name) === "undefined")
                    throw "Unbound variable: " + name;
                env.set(name, value);
            } else if (variable instanceof JsProperty)
                variable.set(value);
            else
                readMacros["set!"](env, _, eval(variable, env), value);
        },
        "lambda": function(env, _, lambdaArgs, body) {
            return function() {
                var numArgs = Math.min(lambdaArgs.length, arguments.length),
                    argMap = {};
                for (var i = 0; i < numArgs; i++)
                    argMap[lambdaArgs[i]] = eval(arguments[i], env);
                return eval(body, new scheme.Environment(argMap, env));
            };
        },
        "quote": function(env, _, value) {
            return value;
        },
        "quasiquote": function(env, _, value) {
            function quasiEval(sexp, env) {
                if (sexp instanceof scheme.Pair)
                    return new scheme.Pair(quasiEval(sexp.car ,env),
                                           quasiEval(sexp.cdr, env));
                if (!scheme.utils.isArray(sexp) || !sexp.length)
                    return sexp;
                var first = sexp[0];
                if (first instanceof scheme.Symbol
                    && first.toString() === "unquote")
                    return eval(sexp[1], env);
                return scheme.utils.map(sexp, function(e) {
                    return quasiEval(e, env);
                });
            }
            return quasiEval(value, env);
        },
        "begin": function(env) {
            var result;
            scheme.utils.forEach(Array.prototype.slice.call(arguments, 2),
                                 function(arg) {
                                     result = eval(arg, env);
                                 });
            return result;
        },
        "and": function(env, _, first, second) {
            return eval(first, env) && eval(second, env);
        },
        "or": function(env, _, first, second) {
            return eval(first, env) || eval(second, env);
        },
        "let": function(env, _, bindings) {
            var bindingMap = {};
            scheme.utils.forEach(bindings, function(binding) {
                bindingMap[binding[0]] = eval(binding[1], env);
            });
            return evalLetBody(new scheme.Environment(bindingMap, env),
                               arguments);
        },
        "let*": function(env, _, bindings) {
            var bindingMap = {},
                newEnv;
            scheme.utils.forEach(bindings, function(binding) {
                bindingMap[binding[0]] = eval(binding[1], newEnv);
                newEnv = new scheme.Environment(bindingMap, env);
            });
            return evalLetBody(newEnv, arguments);
        },
        "try": function(env, _, expression, catchCallback) {
            try {
                return eval(expression, env);
            } catch (e) {
                if (!catchCallback)
                    throw e;
                var f = eval(catchCallback, env);
                return f(e);
            }
        }
    },
    JsProperty = function(object, property) {
        this.object = object;
        this.property = property;
    };

    function removeComments(string) {
        return string.replace(/;.*/g, "");
    }

    function tokenise(string) {
        return string.match(/("[^"]*"|[()]|[^\s()]+)/g);
    }

    function readAtom(token) {
        var first = token[0],
            lastIndex = token.length - 1,
            last = token[lastIndex];
        if (first === '"' || last === '"') {
            if (first !== last)
                throw "Unexpected EOF while reading string";
            return token.substring(1, lastIndex);
        }
        if (first === "#") {
            var rest = token.substring(1);
            if (rest === "t")
                return true;
            else if (rest === "f")
                return false;
            else
                throw "Not a valid boolean literal: " + rest;
        }
        var number = parseFloat(token);
        if (!isNaN(number))
            return number;
        return new scheme.Symbol(token);
    }

    function readTokens(tokens, quasiQuoted) {
        if (tokens.length === 0)
            throw "Unexpected EOF while reading";
        var token = tokens[0];
        tokens.shift();
        if (token === "'")
            return [new scheme.Symbol("quote"),
                    readTokens(tokens, quasiQuoted)];
        if (token === "`")
            return [new scheme.Symbol("quasiquote"), readTokens(tokens, true)];
        if (token === ",")
            return [new scheme.Symbol("unquote"),
                    readTokens(tokens, quasiQuoted)];
        if (token === "(") {
            var list = [];
            while (tokens[0] !== ")")
                list.push(readTokens(tokens, quasiQuoted));
            tokens.shift();
            for (var i = 0; i < list.length; i++)
                if (list[i].toString() === ".") {
                    if (i === 0 || i !== list.length - 2)
                        throw "Invalid dotted list";
                    if (list.length === 3) {
                        if (quasiQuoted)
                            return new scheme.Pair(list[0], list[2]);
                        return scheme.standardProcedures.cons(list[0], list[2]);
                    }
                    break;
                }
            return list;
        }
        if (token === ")")
            throw "Unexpected )";
        return readAtom(token);
    }

    function getJsProperty(list, env) {
        var name = list[0].toString().substring(1),
            objExpr = list[1];
        if (objExpr instanceof scheme.Symbol) {
            var objName = objExpr.toString(),
                obj = (objName === "js") ? this :
                    eval(objExpr, env) || this.eval(objName);
        } else
            obj = eval(objExpr, env);
        var args = evalAll(list.slice(2), env);
        return new JsProperty(obj, name);
    }

    function eval(sexp, env) {
        if (sexp instanceof scheme.Symbol) {
            var name = sexp.toString();
            return (name[0] === "'") ? new scheme.Symbol(name.substring(1)) :
                env.get(name);
        }
        if (!scheme.utils.isArray(sexp))
            return sexp;
        var first = sexp[0];
        if (first instanceof scheme.Symbol && first.toString()[0] === ".")
            return getJsProperty(sexp, env);
        var readMacro = readMacros[first];
        if (readMacro)
            return readMacro.apply(null, [env].concat(sexp));
        return scheme.callProcedure(sexp, env);
    }

    function evalLetBody(env, letArgs) {
        return readMacros["begin"].apply(null, [env, null].concat(
            Array.prototype.slice.call(letArgs, 3)));
    }

    function evalAll(sexps, env) {
        return scheme.utils.map(sexps, function(sexp) {
            return eval(sexp, env);
        });
    }

    function format(result) {
        if (typeof result === "string")
            return '"' + result + '"';
        if (typeof result === "boolean")
            return (result) ? "#t" : "#f";
        if (result instanceof scheme.Symbol)
            return result.toString();
        if (scheme.utils.isArray(result)) {
            var s = "(";
            scheme.utils.forEach(result, function(element) {
                if (s.length > 1)
                    s += " ";
                s += format(element);
            });
            return s + ")";
        }
        if (scheme.utils.isFunction(result))
            return "#procedure";
        if (typeof result === "object")
            return JSON.stringify(result);
        return result;
    }

    JsProperty.prototype = {
        get: function() {
            return this.object[this.property];
        },
        set: function(value) {
            this.object[this.property] = value;
        },
        toString: function() {
            return this.get().toString();
        }
    };

    scheme.Environment = function(entries, outer) {
        this.entries = entries || {};
        this.outer = outer || null;
        if (!(entries || outer)) {
            this.entries = scheme.standardProcedures;
            this.entries["js"] = this;
        }
    }

    scheme.Environment.prototype = {
        get: function(name) {
            var value = this.entries[name];
            if (typeof value !== "undefined")
                return value;
            return (this.outer) ? this.outer.get(name) : undefined;
        },
        define: function(name, value) {
            this.entries[name] = value;
        },
        set: function(name, value) {
            if (this.outer && typeof this.outer.get(name) !== "undefined")
                this.outer.set(name, value);
            else
                this.define(name, value);
        }
    };

    scheme.Symbol = function(s) {
        this.s = s;
    };

    scheme.Symbol.prototype = {
        toString: function() {
            return this.s;
        }
    };

    scheme.Pair = function(car, cdr) {
        this.car = car;
        this.cdr = cdr;
    };

    scheme.read = function(string) {
        var tokens = tokenise(removeComments(string)),
            representation = [];
        while (tokens.length)
            representation.push(readTokens(tokens));
        return representation;
    }

    scheme.callProcedure = function(list, env) {
        var results = (env) ? evalAll(list, env) : list,
            firstResult = results[0];
        if (!firstResult)
            throw list[0] + " is not a procedure";
        results.shift();
        if (firstResult instanceof JsProperty)
            return firstResult.get().apply(firstResult.object, results);
        return firstResult.apply(null, results);
    }

    scheme.eval = function(sexps, env) {
        return scheme.utils.map(evalAll(sexps, env || new scheme.Environment),
                                function (result) {
            return (result instanceof JsProperty) ? result.get() : result;
        });
    }

    scheme.evalString = function(string, env) {
        return scheme.eval(scheme.read(string), env);
    }

    scheme.print = function(results) {
        var s = "";
        for (var i = 0; i < results.length; i++) {
            if (i > 0)
                s += "\n";
            s += format(results[i]);
        }
        return s;
    }

    if (typeof window !== "undefined") {
        scheme.load = function(file, environment) {
            var result;
            scheme.utils.httpGet(file, function(data) {
                result = scheme.evalString(data, environment);
            }, false);
            return result;
        };

        window.onload = function() {
            var scripts = document.getElementsByTagName("script");
            scheme.utils.forEach(scripts, function(script) {
                if (script.type !== "text/x-scheme")
                    return;
                if (script.src.length)
                    scheme.load(script.src);
                else
                    scheme.evalString(script.innerHTML);
            });
        };
    } else {
        scheme.load = function(file, environment) {
            var fs = require("fs"),
                data = fs.readFileSync(file, "utf-8")
            return scheme.evalString(data, environment);
        };
    }

    return scheme;
})((typeof exports !== "undefined") ? exports : {});
