var scheme = {};

(function(scheme) {
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

    function eval(x, env) {
        if (typeof x === "string")
            return env[x];
        if (!isArray(x))
            return x;
        var functionName = x[0];
        if (functionName === "if")
            return eval(eval(x[1], env) ? x[2] : x[3], env);
        else if (functionName == "define") {
            env[x[1]] = eval(x[2], env);
            return null;
        } else if (functionName == "set!") {
            var varName = x[1];
            if (!(varName in env))
                throw "Unbound variable: " + varName;
            env[varName] = x[2];
            return null;
        } else if (["+", "-", "*", "/", "=", ">", "<", ">=", "<="]
                   .indexOf(functionName) !== -1)
            return window.eval(eval(x[1], env) +
                               (functionName === "=" ? "==" : functionName) +
                               eval(x[2]), env);
        throw "Unknown function: " + functionName;
    }

    scheme.eval = function(string, env) {
        return eval(read(string), env);
    };
})(scheme);
