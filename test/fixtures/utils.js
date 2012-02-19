var scheme = require("../../dist/scheme.js"),
    env = new scheme.Environment;

exports.resetEnv = function() {
    env = new scheme.Environment;
};

exports.eval = function(expression) {
    return scheme.eval(scheme.read(expression), env);
};

exports.evalFirst = function(expression) {
    return exports.eval(expression)[0];
};
