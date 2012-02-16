var scheme = {};

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
            body = [new Symbol("begin")]
                .concat(Array.prototype.slice.call(arguments, 3));
            env.set(name, readMacros["lambda"](env, _, args, body));
        },
        "set!": function(env, _, variable, value) {
            var name;
            if (variable instanceof Symbol) {
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
            if (value instanceof Symbol)
                return value.toString();
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
        }
    },
    Symbol = function(s) {
        this.s = s;
    },
    JsProperty = function(object, property) {
        this.object = object;
        this.property = property;
    };

    Symbol.prototype = {
        toString: function() {
            return this.s;
        }
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
                    // TODO: This is a library procedure, it should be
                    //       implemented in Scheme.
                    var str = "";
                    forEach(arguments, function(s) {
                        str += s;
                    });
                    return str;
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

    function removeComments(expression) {
        return expression.replace(/;.*/g, "");
    }

    function tokenise(expression) {
        return expression.match(/("[^"]*"|[()]|[^\s()]+)/g);
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
        return new Symbol(token);
    }
    
    function readTokens(tokens) {
        var token, list, i;
        if (tokens.length === 0)
            throw "Unexpected EOF while reading";
        token = tokens[0];
        tokens.shift();
        if (token === "(") {
            list = [];
            while (tokens[0] !== ")")
                list.push(readTokens(tokens));
            tokens.shift();
            return list;
        } else if (token === ")")
            throw "Unexpected )";
        else
            return readAtom(token);
    }

    function read(expression) {
        var tokens = tokenise(removeComments(expression)),
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

    function getJsProperty(x, env) {
        var name = x[0].toString().substring(1),
            objExpr = x[1],
            objName, obj, args;
        if (objExpr instanceof Symbol) {
            objName = objExpr.toString();
            obj = (objName === "js") ? this :
                eval(objExpr, env) || this.eval(objName);
        } else
            obj = objExpr;
        args = evalAll(x.slice(2), env);
        return new JsProperty(obj, name);
    }

    function callProcedure(x, env) {
        var expressions = evalAll(x, env),
            firstExpression = expressions[0];
        if (!firstExpression)
            throw x[0] + " is not a procedure";
        expressions.shift();
        if (firstExpression instanceof JsProperty)
            return firstExpression.get().apply(firstExpression.object,
                                               expressions);
        return firstExpression.apply(null, expressions);
    }

    function eval(x, env) {
        var first, firstChar, readMacro, expressions, firstExpression;
        if (x instanceof Symbol)
            return env.get(x.toString());
        if (!isArray(x))
            return x;
        first = x[0];
        if (first instanceof Symbol && first.toString()[0] === ".")
            return getJsProperty(x, env);
        readMacro = readMacros[first];
        if (readMacro)
            return readMacro.apply(null, [env].concat(x));
        return callProcedure(x, env);
    }

    function evalAll(xs, env) {
        return map(xs, function(x) {
            return eval(x, env);
        });
    }

    scheme.eval = function(string, env) {
        return map(evalAll(read(string), env), function(result) {
            return (result instanceof JsProperty) ? result.get() : result;
        });
    };

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
                        scheme.eval(data);
                    });
                else
                    scheme.eval(script.innerHTML);
            });
        };
    }
})(typeof exports !== "undefined" && exports || scheme);
