var scheme = require("./scheme.js");

module.exports = {
    setUp: function(callback) {
        var environment = new scheme.Environment;
        this.eval = function(expression) {
            return scheme.eval(expression, environment);
        };
        this.evalFirst = function(expression) {
            return this.eval(expression)[0];
        };
        callback();
    },
    testArithmetic: function(test) {
        test.equal(this.evalFirst("(+ 1 3)"), 4);
        test.equal(this.evalFirst("(- 4 1)"), 3);
        test.equal(this.evalFirst("(* 2 9)"), 18);
        test.equal(this.evalFirst("(/ 20 5)"), 4);
        test.done();
    },
    testComparison: function(test) {
        test.ok(this.evalFirst("(= 1 1)"));
        test.ok(!this.evalFirst("(= 1 2)"));
        test.ok(this.evalFirst("(> 2 1)"));
        test.ok(!this.evalFirst("(> 1 2)"));
        test.ok(this.evalFirst("(< 1 2)"));
        test.ok(!this.evalFirst("(< 2 1)"));
        test.ok(this.evalFirst("(>= 2 1)"));
        test.ok(!this.evalFirst("(>= 1 2)"));
        test.ok(this.evalFirst("(<= 1 2)"));
        test.ok(!this.evalFirst("(<= 2 1)"));
        test.done();
    },
    testConditions: function(test) {
        test.equal(this.evalFirst("(if (= 1 1) 1 2)"), 1);
        test.equal(this.evalFirst("(if (= 1 2) 1 2)"), 2);
        test.equal(this.evalFirst("(if (= 1 1) 1)"), 1);
        test.equal(this.evalFirst("(if (= 1 2) 1)"), undefined);
        test.done();
    },
    testVariables: function(test) {
        test.equal(this.evalFirst("x"), undefined);
        this.evalFirst("(define x 5)");
        test.equal(this.evalFirst("x"), 5);
        this.evalFirst("(set! x 6)");
        test.equal(this.evalFirst("x"), 6);
        test.done();
    },
    testLambdas: function(test) {
        test.equal(this.evalFirst("((lambda (x) (* x x)) 2)"), 4);
        test.done();
    },
    testMultipleExpressions: function(test) {
        test.deepEqual(this.eval("1 2"), [1, 2]);
        test.deepEqual(this.eval("(+ 1 2) (- 5 1)"), [3, 4]);
        test.deepEqual(this.eval("(define x 5) (* x 2)"), [undefined, 10]);
        test.done();
    },
    testExecuteJavaScriptFunction: function(test) {
        var stubWasCalled = false;
        stub = function() {
            stubWasCalled = true;
        };
        this.evalFirst("(.stub js)");
        test.ok(stubWasCalled,
                "The JavaScript function stub() should have been called");
        delete stub;
        test.done();
    },
    testQuoting: function(test) {
        test.equal(this.evalFirst("(quote hello)"), "hello");
        test.deepEqual(this.evalFirst("(quote (1 2 3))"), [1, 2, 3]);
        test.done();
    }
};
