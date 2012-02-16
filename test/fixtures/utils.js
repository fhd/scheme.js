var scheme = require("../../src/scheme.js"),
    env = new scheme.Environment;

exports.resetEnv = function() {
    env = new scheme.Environment;
};

exports.eval = function(expression) {
    return scheme.eval(expression, env);
};

exports.evalFirst = function(expression) {
    return exports.eval(expression)[0];
};


