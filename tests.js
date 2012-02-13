var scheme = require("./scheme.js");

module.exports = {
    setUp: function(callback) {
        var environment = new scheme.Environment;
        this.eval = function(expression) {
            return scheme.eval(expression, environment);
        };
        callback();
    },
    testArithmetic: function(test) {
        test.equal(this.eval("(+ 1 3)"), 4);
        test.equal(this.eval("(- 4 1)"), 3);
        test.equal(this.eval("(* 2 9)"), 18);
        test.equal(this.eval("(/ 20 5)"), 4);
        test.done();
    },
    testComparison: function(test) {
        test.ok(this.eval("(= 1 1)"));
        test.ok(!this.eval("(= 1 2)"));
        test.ok(this.eval("(> 2 1)"));
        test.ok(!this.eval("(> 1 2)"));
        test.ok(this.eval("(< 1 2)"));
        test.ok(!this.eval("(< 2 1)"));
        test.ok(this.eval("(>= 2 1)"));
        test.ok(!this.eval("(>= 1 2)"));
        test.ok(this.eval("(<= 1 2)"));
        test.ok(!this.eval("(<= 2 1)"));
        test.done();
    },
    testConditions: function(test) {
        test.equal(this.eval("(if (= 1 1) 1 2)"), 1);
        test.equal(this.eval("(if (= 1 2) 1 2)"), 2);
        test.equal(this.eval("(if (= 1 1) 1)"), 1);
        test.equal(this.eval("(if (= 1 2) 1)"), undefined);
        test.done();
    },
    testVariables: function(test) {
        test.equal(this.eval("x"), undefined);
        this.eval("(define x 5)");
        test.equal(this.eval("x"), 5);
        this.eval("(set! x 6)");
        test.equal(this.eval("x"), 6);
        test.done();
    },
    testLambdas: function(test) {
        test.equal(this.eval("((lambda (x) (* x x)) 2)"), 4);
        test.done();
    },
    testMultipleExpressions: function(test) {
        test.equal(this.eval("1 2"), [1, 2]);
        test.done();
    }
};
