var utils = require("./fixtures/utils.js");

module.exports = {
    setUp: function(callback) {
        utils.resetEnv();
        callback();
    },
    testArithmetic: function(test) {
        test.equal(utils.evalFirst("(+ 1 3)"), 4);
        test.equal(utils.evalFirst("(- 4 1)"), 3);
        test.equal(utils.evalFirst("(* 2 9)"), 18);
        test.equal(utils.evalFirst("(/ 20 5)"), 4);
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
    }
}
