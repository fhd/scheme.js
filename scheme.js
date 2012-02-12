var scheme = {};

(function(scheme) {
    var readMacros = readMacros = {
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
        "=": function(env, _, first, second) {
            return eval(first, env) == eval(second, env);
        }
    };

    function forEach(array, f) {
        var i;
        for (i = 0; i < array.length; i++)
            f(array[i]);
    }

    forEach(["+", "-", "*", "/", ">", "<", ">=", "<="], function(operator) {
        readMacros[operator] = function(env, operator, first, second) {
            return this.eval(eval(first, env) + operator + eval(second, env));
        };
    });

    scheme.Environment = function(entries, outer) {
        this.entries = entries || {};
        this.outer = outer || null;
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
        return readTokens(tokenise(expression));
    }

    function isArray(x) {
        return Object.prototype.toString.call(x) === '[object Array]';
    }

    function map(array, f) {
        var i, newArray = [];
        for (i = 0; i < array.length; i++)
            newArray.push(f(array[i]));
        return newArray;
    }

    function callProcedure(x, env) {
        var expressions = map(x, function(element) {
                return eval(element, env);
            }),
            firstExpression = expressions[0];
        expressions.shift();
        return firstExpression.apply(null, expressions);
    }

    function eval(x, env) {
        var readMacro, expressions, firstExpression;
        if (typeof x === "string")
            return env.get(x);
        if (!isArray(x))
            return x;
        readMacro = readMacros[x[0]];
        if (readMacro)
            return readMacro.apply(null, [env].concat(x));
        return callProcedure(x, env);
    }

    scheme.eval = function(string, env) {
        return eval(read(string), env);
    };
})(typeof exports !== "undefined" && exports || scheme);
