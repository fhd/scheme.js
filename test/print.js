var scheme = require("../dist/scheme.js");

function printOne(result) {
    return scheme.print([result]);
}

module.exports = {
    testMultiple: function(test) {
        test.equal(scheme.print([1, 2]), "1\n2");
        test.done();
    },
    testStrings: function(test) {
        test.equal(printOne("hello"), '"hello"');
        test.done();
    },
    testBooleans: function(test) {
        test.equal(printOne(true), "#t");
        test.equal(printOne(false), "#f");
        test.done();
    },
    testSymbols: function(test) {
        test.equal(printOne(new scheme.Symbol("hello")), "hello");
        test.done();
    },
    testLists: function(test) {
        test.equal(printOne([1, 2, 3]), "(1 2 3)");
        test.done();
    },
    testProcedures: function(test) {
        test.equal(printOne(function() {}), "#procedure");
        test.done();
    }
};
