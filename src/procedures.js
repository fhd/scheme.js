scheme.standardProcedures = (function(scheme) {
    return {
        "=": function(first, second) {
            return first === second;
        },
        ">": function(first, second) {
            return first > second;
        },
        "<": function(first, second) {
            return first < second;
        },
        ">=": function(first, second) {
            return first >= second;
        },
        "<=": function(first, second) {
            return first <= second;
        },
        "+": function() {
            var sum = 0;
            scheme.utils.forEach(arguments, function(n) {
                sum += n;
            });
            return sum;
        },
        "-": function() {
            var difference = arguments[0];
            if (arguments.length === 1)
                return -difference;
            scheme.utils.forEach(Array.prototype.slice.call(arguments, 1),
                    function(n) {
                        difference -= n;
                    });
            return difference;
        },
        "*": function() {
            var product = 1;
            scheme.utils.forEach(arguments, function(n) {
                product *= n;
            });
            return product;
        },
        "/": function() {
            var quotient = arguments[0];
            if (arguments.length === 1)
                return 1/quotient;
            scheme.utils.forEach(Array.prototype.slice.call(arguments, 1),
                    function(n) {
                        quotient /= n;
                    });
            return quotient;
        },
        "string-append": function() {
            var str = "";
            scheme.utils.forEach(arguments, function(s) {
                str += s;
            });
            return str;
        },
        "cons": function(car, cdr) {
            if (scheme.utils.isArray(cdr))
                return (cdr.length) ? [car].concat(cdr) : [car];
            if (cdr instanceof scheme.Pair)
                return [car].concat(cdr.car, new scheme.Symbol("."), cdr.cdr);
            return new scheme.Pair(car, cdr);
        },
        "apply": function(procedure, args) {
            return scheme.callProcedure([procedure].concat(args));
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
        },
        "make-object": function(properties) {
            var obj = {};
            scheme.utils.forEach(properties, function(property) {
                obj[property.car] = property.cdr;
            });
            return obj;
        },
        "read": function(string) {
            // TODO: This should use a port, not a string
            return scheme.read(string);
        },
        "eval": function(expression, environment) {
            return scheme.eval([expression], environment)[0];
        },
        "print": function(expressions) {
            return scheme.print(expressions);
        },
        "eval-string": function(string, environment) {
            return scheme.evalString(string, environment);
        },
        "load": function(file, environment) {
            return scheme.load(file, environment);
        }
    };
})(scheme);
