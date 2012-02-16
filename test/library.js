var utils = require("./fixtures/utils.js");

module.exports = {
    setUp: function(callback) {
        utils.resetEnv();
        callback();
    },
    stringAppend: function(test) {
        test.equal(utils.evalFirst('(string-append "Hello" ", " "World" "!")'),
                   "Hello, World!");
        test.done();
    }
}
