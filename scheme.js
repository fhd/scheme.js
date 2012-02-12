var scheme = {};

(function(scheme) {
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
        if (tokens.length === 0)
            throw "Unexpected EOF while reading";
        var token = tokens[0];
        tokens.shift();
        if (token === "(") {
            var list = [];
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
        var newArray = [];
        for (var i = 0; i < array.length; i++)
            newArray.push(f(array[i]));
        return newArray;
    }

    function eval(x, env) {
        if (typeof x === "string")
            return env.get(x);
        if (!isArray(x))
            return x;
        var first = x[0];
        if (first === "if")
            return eval(eval(x[1], env) ? x[2] : x[3], env);
        else if (first == "define") {
            env.set(x[1], eval(x[2], env));
            return null;
        } else if (first == "set!") {
            var varName = x[1];
            if (!(varName in env))
                throw "Unbound variable: " + varName;
            env.set(varName, x[2]);
            return null;
        } else if (first == "lambda") {
            return function() {
                var lambdaArgs = x[1];
                if (arguments.length !== lambdaArgs.length)
                    throw "Invalid number of arguments. Expected " +
                        lambdaArgs.length + ", got " + arguments.length;
                var argumentMap = {};
                for (var i = 0; i < lambdaArgs.length; i++)
                    argumentMap[lambdaArgs[i]] = arguments[i];
                return eval(x[2], new scheme.Environment(argumentMap, env));
            };
        } else if (["+", "-", "*", "/", "=", ">", "<", ">=", "<="]
                   .indexOf(first) !== -1) {
            return window.eval(eval(x[1], env) +
                               (first === "=" ? "==" : first) +
                               eval(x[2], env));
        }
        var expressions = map(x, function(element) {
                return eval(element, env);
            }),
            firstExpression = expressions[0];
        expressions.shift();
        return firstExpression.apply(null, expressions);
    }

    scheme.eval = function(string, env) {
        return eval(read(string), env);
    };
})(scheme);
