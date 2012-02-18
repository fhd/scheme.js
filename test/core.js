var utils = require("./fixtures/utils.js");

module.exports = {
    setUp: function(callback) {
        utils.resetEnv();
        callback();
    },
    testBooleans: function(test) {
        test.equal(utils.evalFirst("#t"), true);
        test.equal(utils.evalFirst("#f"), false);
        test.done();
    },
    testConditions: function(test) {
        test.equal(utils.evalFirst("(if #t 1 2)"), 1);
        test.equal(utils.evalFirst("(if #f 1 2)"), 2);
        test.equal(utils.evalFirst("(if #t 1)"), 1);
        test.equal(utils.evalFirst("(if #f 1)"), undefined);
        test.done();
    },
    testVariables: function(test) {
        test.equal(utils.evalFirst("x"), undefined);
        utils.eval("(define x 5)");
        test.equal(utils.evalFirst("x"), 5);
        utils.eval("(set! x 6)");
        test.equal(utils.evalFirst("x"), 6);
        utils.eval("(set! x 0)");
        test.equal(utils.evalFirst("x"), 0);
        utils.eval("(set! x #f)");
        test.equal(utils.evalFirst("x"), false);
        test.done();
    },
    testLambdas: function(test) {
//        test.equal(utils.evalFirst("((lambda (x) (* x x)) 2)"), 4);
//        test.equal(utils.eval("(define x 3) ((lambda (y) (* x y)) 2)")[1], 6);
        test.equal(utils.eval(
            "(define x 1) ((lambda () (define x 2))) x")[2], 1);
        test.equal(utils.eval("(define x 1) ((lambda () (set! x 2))) x")[2], 2);
        test.done();
    },
    testMultipleExpressions: function(test) {
        test.deepEqual(utils.eval("1 2"), [1, 2]);
        test.deepEqual(utils.eval("(define x 5) (* x 2)"), [undefined, 10]);
        test.done();
    },
    testQuoting: function(test) {
        test.equal(utils.evalFirst("(quote hello)"), "hello");
        test.deepEqual(utils.evalFirst("(quote (1 2 3))"), [1, 2, 3]);
        test.equal(utils.evalFirst("'hello"), "hello");
        test.deepEqual(utils.evalFirst("'(1 2 3)"), [1, 2, 3]);
        test.done();
    },
    testStrings: function(test) {
        test.equal(utils.evalFirst('"hello"'), "hello");
        test.done();
    },
    testBegin: function(test) {
        test.equal(utils.evalFirst("(begin 1 2 3)"), 3);
        test.done();
    },
    testProcedures: function(test) {
        utils.eval("(define (pow x) (* x x))");
        test.equal(utils.evalFirst("(pow 10)"), 100);
        test.equal(utils.evalFirst("(pow (* 2 5))"), 100);
        test.done();
    },
    testComments: function(test) {
        test.ok(utils.eval("1 ; 2").length === 1);
        test.done();
    },
    testLet: function(test) {
        test.equal(utils.evalFirst("(let ((x 1) (y 2)) x y)"), 2);
        test.equal(utils.evalFirst("(let* ((x 1) (y (* 2 x))) y)"), 2);
        test.done();
    },
    testPairs: function(test) {
        test.deepEqual(utils.evalFirst("'(1 . 2)"), {car: 1, cdr: 2});
        test.deepEqual(utils.evalFirst("'(1 . ())"), [1]);
        test.deepEqual(utils.evalFirst("'(1 . (2 . ()))"), [1, 2]);
        test.deepEqual(utils.evalFirst("'(1 . (2 . (3 . ())))"), [1, 2, 3]);
        test.deepEqual(utils.evalFirst("'(1 . (2 . 3))"), [1, 2, {s: "."}, 3]);
        test.done();
    },
    testDottedLists: function(test) {
        const dot = {s: "."};
        test.deepEqual(utils.evalFirst("'(1 2 . 3)"), [1, 2, dot, 3]);
        test.deepEqual(utils.evalFirst("'(1 . .)"), {car: 1, cdr: dot});
        test.deepEqual(utils.evalFirst("'(1 2 . .)"), [1, 2, dot, dot]);
        test.throws(utils.evalFirst.bind(null, "'(.)"));
        test.throws(utils.evalFirst.bind(null, "'(1 .)"));
        test.throws(utils.evalFirst.bind(null, "'(. 2)"));
        test.throws(utils.evalFirst.bind(null, "'(1 . 2 3)"));
        test.throws(utils.evalFirst.bind(null, "'(1 2 . 3 4)"));
        test.throws(utils.evalFirst.bind(null, "'(. .)"));
        test.throws(utils.evalFirst.bind(null, "'(. . .)"));
        test.throws(utils.evalFirst.bind(null, "'(1 . . .)"));
        test.done();
    }
};
