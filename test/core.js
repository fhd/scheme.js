var scheme = require("../src/scheme.js");

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
        test.ok(this.evalFirst("(and 1 1)"));
        test.ok(!this.evalFirst("(and 1 0)"));
        test.ok(this.evalFirst("(or 1 0)"));
        test.ok(!this.evalFirst("(or 0 0)"));
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
        this.eval("(define x 5)");
        test.equal(this.evalFirst("x"), 5);
        this.eval("(set! x 6)");
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
    testQuoting: function(test) {
        test.equal(this.evalFirst("(quote hello)"), "hello");
        test.deepEqual(this.evalFirst("(quote (1 2 3))"), [1, 2, 3]);
        test.done();
    },
    testStrings: function(test) {
        test.equal(this.evalFirst('"hello"'), "hello");
        test.done();
    },
    testJavaScriptFunctions: function(test) {
        var stubWasCalled = false;
        stub = function() {
            stubWasCalled = true;
        };
        this.eval("((.stub js))");
        test.ok(stubWasCalled,
                "The JavaScript function stub() should have been called");
        delete stub;
        test.equal(this.evalFirst('((.substring "hello") 0 4)'), "hell");
        this.eval('(define s "hello")');
        test.equal(this.evalFirst("((.substring s) 0 4)"), "hell");
        test.done();
    },
    testJavaScriptVariables: function(test) {
        foo = "bar";
        test.equal(this.eval("(.foo js)"), "bar");
        this.eval('(set! (.foo js) "foobar")');
        test.equal(foo, "foobar");
        delete foo;
        test.done();
    },
    testBegin: function(test) {
        test.equal(this.evalFirst("(begin 1 2 3)"), 3);
        test.done();
    },
    testProcedures: function(test) {
        this.eval("(define (pow x) (* x x))");
        test.equal(this.evalFirst("(pow 10)"), 100);
        test.equal(this.evalFirst("(pow (* 2 5))"), 100);
        test.done();
    },
    testComments: function(test) {
        test.ok(this.eval("1 ; 2").length === 1);
        test.done();
    },
    testBooleans: function(test) {
        test.equal(this.evalFirst("#t"), true);
        test.equal(this.evalFirst("#f"), false);
        test.done();
    },
    testLet: function(test) {
        test.equal(this.evalFirst("(let ((x 1) (y 2)) x y)"), 2);
        test.equal(this.evalFirst("(let* ((x 1) (y (* 2 x))) y)"), 2);
        test.done();
    }
};
