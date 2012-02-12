var scheme = require("./scheme.js"),
    environment = new scheme.Environment;

exports.testArithmetic = function(test) {
    test.equal(scheme.eval("(+ 1 3)", environment), 4);
    test.equal(scheme.eval("(- 4 1)", environment), 3);
    test.equal(scheme.eval("(* 2 9)", environment), 18);
    test.equal(scheme.eval("(/ 20 5)", environment), 4);
    test.done();
};
