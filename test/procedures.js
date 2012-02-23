var utils = require("./fixtures/utils.js");

module.exports = {
    setUp: function(callback) {
        utils.resetEnv();
        callback();
    },
    testAddition: function(test) {
        test.equal(utils.evalFirst("(+ 1 2)"), 3);
        test.equal(utils.evalFirst("(+ 1 2 3)"), 6);
        test.done();
    },
    testSubtraction: function(test) {
        test.equal(utils.evalFirst("(- 2 1)"), 1);
        test.equal(utils.evalFirst("(- 1)"), -1);
        test.equal(utils.evalFirst("(- 3 2 1)"), 0);
        test.done();
    },
    testMultiplication: function(test) {
        test.equal(utils.evalFirst("(* 1 2)"), 2);
        test.equal(utils.evalFirst("(* 1 2 3)"), 6);
        test.done();
    },
    testDivision: function(test) {
        test.equal(utils.evalFirst("(/ 20 5)"), 4);
        test.equal(utils.evalFirst("(/ 2)"), 0.5);
        test.equal(utils.evalFirst("(/ 20 5 2)"), 2);
        test.done();
    },
    testComparison: function(test) {
        test.ok(utils.evalFirst("(= 1 1)"));
        test.ok(!utils.evalFirst("(= 1 2)"));
        test.ok(utils.evalFirst("(> 2 1)"));
        test.ok(!utils.evalFirst("(> 1 2)"));
        test.ok(utils.evalFirst("(< 1 2)"));
        test.ok(!utils.evalFirst("(< 2 1)"));
        test.ok(utils.evalFirst("(>= 2 1)"));
        test.ok(!utils.evalFirst("(>= 1 2)"));
        test.ok(utils.evalFirst("(<= 1 2)"));
        test.ok(!utils.evalFirst("(<= 2 1)"));
        test.ok(utils.evalFirst("(and 1 1)"));
        test.ok(!utils.evalFirst("(and 1 0)"));
        test.ok(utils.evalFirst("(or 1 0)"));
        test.ok(!utils.evalFirst("(or 0 0)"));
        test.done();
    },
    testStringAppend: function(test) {
        test.equal(utils.evalFirst('(string-append "Hello" ", " "World" "!")'),
                   "Hello, World!");
        test.done();
    },
    testCons: function(test) {
        test.deepEqual(utils.evalFirst("(cons 1 '(2 3))"), [1, 2, 3]);
        test.deepEqual(utils.evalFirst("(cons 1 '())"), [1]);
        test.deepEqual(utils.evalFirst("(cons '(1) '(2 3))"), [[1], 2, 3]);
        test.deepEqual(utils.evalFirst("(cons 1 2)"), {car: 1, cdr: 2});
        test.done();
    },
    testApply: function(test) {
        test.equal(utils.evalFirst("(apply + '(1 2))"), 3);
        test.equal(utils.evalFirst(
            '(apply string-append \'("Hello" ", " "World"))'), "Hello, World");
        test.done();
    },
    testRead: function(test) {
        test.deepEqual(utils.evalFirst('(read "(+ 1 2)")'), [[{s: "+"}, 1, 2]]);
        test.done();
    },
    testEval: function(test) {
        test.equal(utils.evalFirst("(eval '(+ 1 2))"), 3);
        test.done();
    },
    testPrint: function(test) {
        test.equal(utils.evalFirst("(print '((1 2)))"), "(1 2)");
        test.done();
    },
    testEvalString: function(test) {
        test.equal(utils.evalFirst('(eval-string "(+ 1 2)")'), 3);
        test.done();
    }
}
