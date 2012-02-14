var scheme = {};

(function(scheme) {
    var readMacros = {
        "if": function(env, _, test, consequence, alternative) {
            return eval(eval(test, env) ? consequence : alternative, env);
        },
        "define": function(env, _, name, value) {
            env.set(name, eval(value, env));
        },
        "set!": function(env, _, name, value) {
            if (!env.get(name))
                throw "Unbound variable: " + name;
            env.set(name, value);
        },
        "lambda": function(env, _, lambdaArgs, body) {
            return function() {
                var argMap, i;
                if (arguments.length !== lambdaArgs.length)
                    throw "Invalid number of arguments. Expected " +
                        lambdaArgs.length + ", got " + arguments.length;
                argMap = {};
                for (i = 0; i < lambdaArgs.length; i++)
                    argMap[lambdaArgs[i]] = arguments[i];
                return eval(body, new scheme.Environment(argMap, env));
            };
        },
        "quote": function(env, _, value) {
            return value;
        },
        "begin": function(env) {
            var result;
            forEach(Array.prototype.slice.call(arguments, 1), function(arg) {
                result = eval(arg, env);
            });
            return result;
        }
    };

    function forEach(array, f) {
        var i;
        for (i = 0; i < array.length; i++)
            f(array[i]);
    }

    scheme.Environment = function(entries, outer) {
        this.entries = entries || {};
        this.outer = outer || null;
        if (!(entries || outer)) {
            this.entries["="] = function(first, second) {
                return first == second;
            };
            var that = this;
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

    function tokenise(expression) {
        return expression.match(/([()]|[^\s()]+)/g);
    }

    function readAtom(token) {
        var number = parseFloat(token);
        if (!isNaN(number))
            return number;
        return token;
    }
    
    function readTokens(tokens) {
        var token, list;
        if (tokens.length === 0)
            throw "Unexpected EOF while reading";
        token = tokens[0];
        tokens.shift();
        if (token === "(") {
            list = [];
            while (tokens[0] != ")")
                list.push(readTokens(tokens));
            tokens.shift();
            return list;
        } else if (token === ")")
            throw "Unexpected )";
        else
            return readAtom(token);
    }

    function read(expression) {
        var tokens = tokenise(expression),
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

    function callNativeFunction(x) {
        var f = x[0].substring(1),
            objName = x[1],
            obj = (objName === "js") ? this : this.eval(objName),
            args = x.slice(2);
        return obj[f].apply(obj, args);
    }

    function callProcedure(x, env) {
        var expressions = map(x, function(element) {
                return eval(element, env);
            }),
            firstExpression = expressions[0];
        if (!firstExpression)
            throw x[0] + " is not a procedure";
        expressions.shift();
        return firstExpression.apply(null, expressions);
    }

    function eval(x, env) {
        var first, firstChar, readMacro, expressions, firstExpression;
        if (typeof x === "string")
            return env.get(x);
        if (!isArray(x))
            return x;
        first = x[0];
        if (first[0] === ".")
            return callNativeFunction(x);
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
        return evalAll(read(string), env);
    };

    function httpGet(uri, callback) {
        var httpRequest;
        if (window.XMLHttpRequest)
            httpRequest = new XMLHttpRequest;
        else if (window.ActiveXObject)
            httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
        httpRequest.onreadystatechange = function() {
            if (httpRequest.readyState != 4)
                return;
            var status = httpRequest.status;
            if (status === 0 || status === 200)
                callback(httpRequest.responseText);
            else
                console.error("Unable to load scheme script from: " + uri +
                              ", status: " + statusText);
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
