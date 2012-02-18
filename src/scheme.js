var scheme = (typeof exports !== "undefined") ? exports : {};

(function(scheme) {
    var readMacros = {
        "if": function(env, _, test, consequence, alternative) {
            return eval(eval(test, env) ? consequence : alternative, env);
        },
        "define": function(env, _, first, second) {
            var name, args, body;
            if (!isArray(first)) {
                env.set(first, eval(second, env));
                return;
            }
            name = first[0];
            args = first.slice(1);
            body = [new scheme.Symbol("begin")]
                .concat(Array.prototype.slice.call(arguments, 3));
            env.set(name, readMacros["lambda"](env, _, args, body));
        },
        "set!": function(env, _, variable, value) {
            var name;
            if (variable instanceof scheme.Symbol) {
                name = variable.toString();
                if (!env.get(name))
                    throw "Unbound variable: " + name;
                env.set(name, value);
            } else if (variable instanceof JsProperty)
                variable.set(value);
            else
                readMacros["set!"](env, _, eval(variable, env), value);
        },
        "lambda": function(env, _, lambdaArgs, body) {
            return function() {
                var argMap, i;
                if (arguments.length !== lambdaArgs.length)
                    throw "Invalid number of arguments. Expected " +
                        lambdaArgs.length + ", got " + arguments.length;
                argMap = {};
                for (i = 0; i < lambdaArgs.length; i++)
                    argMap[lambdaArgs[i]] = eval(arguments[i], env);
                return eval(body, new scheme.Environment(argMap, env));
            };
        },
        "quote": function(env, _, value) {
            return value;
        },
        "begin": function(env) {
            var result;
            forEach(Array.prototype.slice.call(arguments, 2), function(arg) {
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
            forEach(bindings, function(binding) {
                bindingMap[binding[0]] = eval(binding[1], env);
            });
            return evalLetBody(new scheme.Environment(bindingMap, env),
                               arguments);
        },
        "let*": function(env, _, bindings) {
            var bindingMap = {},
                newEnv;
            forEach(bindings, function(binding) {
                bindingMap[binding[0]] = eval(binding[1], newEnv);
                newEnv = new scheme.Environment(bindingMap, env);
            });
            return evalLetBody(newEnv, arguments);
        },
        "make-object": function(env, _, properties) {
            var obj = {};
            forEach(properties, function(property) {
                obj[property[0].toString()] = eval(property[1], env);
            });
            return obj;
        }
    },
    JsProperty = function(object, property) {
        this.object = object;
        this.property = property;
    },
    Pair = function(car, cdr) {
        this.car = car;
        this.cdr = cdr;
    };

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

    function forEach(array, f) {
        var i;
        for (i = 0; i < array.length; i++)
            f(array[i]);
    }

    function evalLetBody(env, letArgs) {
        return readMacros["begin"].apply(null, [env, null].concat(
            Array.prototype.slice.call(letArgs, 3)));
    }

    scheme.Environment = function(entries, outer) {
        var that;
        this.entries = entries || {};
        this.outer = outer || null;
        if (!(entries || outer)) {
            this.entries = {
                "=": function(first, second) {
                    return first === second;
                },
                "string-append": function() {
                    var str = "";
                    forEach(arguments, function(s) {
                        str += s;
                    });
                    return str;
                },
                "cons": cons,
                "apply": function(procedure, args) {
                    return callProcedure([procedure].concat(args));
                },
                "new": function() {
                    var s, i, result;
                    this.schemeTemp = {
                        constructor: arguments[0].get(),
                        args: Array.prototype.slice.call(arguments, 1)
                    };
                    s = "new this.schemeTemp.constructor(";
                    for (i = 0; i < this.schemeTemp.args.length; i++) {
                        if (i > 0)
                            s += ",";
                        s += "this.schemeTemp.args[" + i + "]";
                    }
                    s += ");";
                    result = this.eval(s);
                    delete this.schemeTemp;
                    return result;
                }
            };
            that = this;
            forEach(["+", "-", "*", "/", ">", "<", ">=", "<="],
                    function(operator) {
                        that.entries[operator] = function(first, second) {
                            return this.eval(first + operator + second);
                        };
                    });
        }
    }

    scheme.Environment.prototype = {
        get: function(name) {
            return this.entries[name]
                || (this.outer ? this.outer.get(name) : null);
        },
        set: function(name, value) {
            this.entries[name] = value;
        }
    };

    scheme.Symbol = function(s) {
        this.s = s;
    },
    scheme.Symbol.prototype = {
        toString: function() {
            return this.s;
        }
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
            last = token[lastIndex],
            rest, number;
        if (first === '"' || last === '"') {
            if (first !== last)
                throw "Unexpected EOF while reading string";
            return token.substring(1, lastIndex);
        }
        if (first === "#") {
            rest = token.substring(1);
            if (rest === "t")
                return true;
            else if (rest === "f")
                return false;
            else
                throw "Not a valid boolean literal: " + rest;
        }
        number = parseFloat(token);
        if (!isNaN(number))
            return number;
        return new scheme.Symbol(token);
    }

    function cons(car, cdr) {
        if (isArray(cdr))
            return (cdr.length) ? [car].concat(cdr) : [car];
        if (cdr instanceof Pair)
            return [car].concat(cdr.car, new scheme.Symbol("."), cdr.cdr);
        return new Pair(car, cdr);
    }
    
    function readTokens(tokens) {
        var token, isPair, i, list;
        if (tokens.length === 0)
            throw "Unexpected EOF while reading";
        token = tokens[0];
        tokens.shift();
        if (token === "'") {
            return [new scheme.Symbol("quote"), readTokens(tokens)];
        } else if (token === "(") {
            list = [];
            while (tokens[0] !== ")")
                list.push(readTokens(tokens));
            tokens.shift();
            for (i = 0; i < list.length; i++)
                if (list[i].toString() === ".") {
                    if (i === 0 || i !== list.length - 2)
                        throw "Invalid dotted list";
                    if (list.length === 3)
                        return cons(list[0], list[2]);
                    break;
                }
            return list;
        } else if (token === ")")
            throw "Unexpected )";
        else
            return readAtom(token);
    }

    scheme.read = function(string) {
        var tokens = tokenise(removeComments(string)),
            representation = [];
        while (tokens.length)
            representation.push(readTokens(tokens));
        return representation;
    }

    function isArray(x) {
        return Object.prototype.toString.call(x) === '[object Array]';
    }

    function map(array, f) {
        var newArray = [], i;
        for (i = 0; i < array.length; i++)
            newArray.push(f(array[i]));
        return newArray;
    }

    function getJsProperty(list, env) {
        var name = list[0].toString().substring(1),
            objExpr = list[1],
            objName, obj, args;
        if (objExpr instanceof scheme.Symbol) {
            objName = objExpr.toString();
            obj = (objName === "js") ? this :
                eval(objExpr, env) || this.eval(objName);
        } else
            obj = objExpr;
        args = evalAll(list.slice(2), env);
        return new JsProperty(obj, name);
    }

    function isFunction(f) {
        return f && {}.toString.call(f) === "[object Function]";
    }

    function callProcedure(list, env) {
        var results = (env) ? evalAll(list, env) : list,
            firstResult = results[0];
        if (!firstResult)
            throw list[0] + " is not a procedure";
        results.shift();
        if (firstResult instanceof JsProperty)
            return firstResult.get().apply(firstResult.object, results);
        return firstResult.apply(null, results);
    }

    function eval(sexp, env) {
        var name, first, firstChar, readMacro;
        if (sexp instanceof scheme.Symbol) {
            name = sexp.toString();
            return (name[0] === "'") ? new scheme.Symbol(name.substring(1)) :
                env.get(name);
        }
        if (!isArray(sexp))
            return sexp;
        first = sexp[0];
        if (first instanceof scheme.Symbol && first.toString()[0] === ".")
            return getJsProperty(sexp, env);
        readMacro = readMacros[first];
        if (readMacro)
            return readMacro.apply(null, [env].concat(sexp));
        return callProcedure(sexp, env);
    }

    function evalAll(sexps, env) {
        return map(sexps, function(sexp) {
            return eval(sexp, env);
        });
    }

    scheme.eval = function(sexps, env) {
        return map(evalAll(sexps, env), function (result) {
            return (result instanceof JsProperty) ? result.get() : result;
        });
    }

    function format(result) {
        var s;
        if (typeof result === "string")
            return '"' + result + '"';
        if (typeof result === "boolean")
            return (result) ? "#t" : "#f";
        if (result instanceof scheme.Symbol)
            return result.toString();
        if (isArray(result)) {
            s = "(";
            result.forEach(function(element) {
                if (s.length > 1)
                    s += " ";
                s += format(element);
            });
            return s + ")";
        }
        if (isFunction(result))
            return "#procedure";
        if (typeof result === "object")
            return JSON.stringify(result);
        return result;
    }

    scheme.print = function(results) {
        var s = "";
        forEach(results, function(result) {
            s += format(result) + "\n";
        });
        return s;
    }

    function httpGet(uri, callback) {
        var httpRequest;
        if (window.XMLHttpRequest)
            httpRequest = new XMLHttpRequest;
        else if (window.ActiveXObject)
            httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
        httpRequest.onreadystatechange = function() {
            if (httpRequest.readyState !== 4)
                return;
            var status = httpRequest.status;
            if (status === 0 || status === 200)
                callback(httpRequest.responseText);
            else
                throw "Unable to load scheme script from: " + uri +
                    ", status: " + statusText;
        };
        httpRequest.open("GET", uri);
        httpRequest.send();
    }

    if (typeof window !== "undefined") {
        window.onload = function() {
            var scripts = document.getElementsByTagName("script");
            forEach(scripts, function(script) {
                if (script.type !== "text/scheme")
                    return;
                if (script.src.length)
                    httpGet(script.src, function(data) {
                        scheme.eval(scheme.read(data));
                    });
                else
                    scheme.eval(script.innerHTML);
            });
        };
    }
})(scheme);
