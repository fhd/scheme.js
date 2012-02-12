var scheme = require("./scheme.js"),
    env = new scheme.Environment,
    sys = require("sys"),
    readline = require("readline"),
    rl = readline.createInterface(process.stdin, process.stdout);

rl.setPrompt("=> ");
rl.on("line", function(cmd) {
    if (cmd.length)
        try {
            sys.puts(scheme.eval(cmd, env));
        } catch (e) {
            sys.puts("Error: " + e);
        }
    rl.prompt();
});
rl.on("close", function() {
    sys.puts("");
    process.exit(0);
});

rl.prompt();
