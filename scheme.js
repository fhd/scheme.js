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
    
    function read(tokens) {
        if (tokens.length === 0)
            throw "Unexpected EOF while reading";
        var token = tokens[0];
        tokens.shift();
        if (token === "(") {
            var list = [];
            while (tokens[0] != ")")
                list.push(read(tokens));
            tokens.shift();
            return list;
        } else if (token === ")")
            throw "Unexpected )";
        else
            return readAtom(token);
    }

    function parse(expression) {
        return read(tokenise(expression));
    }

    function isArray(x) {
        return Object.prototype.toString.call(x) === '[object Array]';
    }

    function eval(parseTree) {
        if (!isArray(parseTree))
            return parseTree;
        var functionName = parseTree[0];
        if (["+", "-", "*", "/"].indexOf(functionName) !== -1)
            return window.eval(eval(parseTree[1]) + functionName +
                               eval(parseTree[2]));
        throw "Unknown function: " + functionName;
    }

    scheme.eval = function(string) {
        return eval(parse(string));
    };
})(scheme);

