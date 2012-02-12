var scheme = require("./scheme.js"),
    env = new scheme.Environment,
    sys = require("sys"),
    readline = require("readline"),
    rl = readline.createInterface(process.stdin, process.stdout);

rl.setPrompt("=> ");
rl.on("line", function(cmd) {
    if (cmd.length)
        sys.puts(scheme.eval(cmd, env));
    rl.prompt();
});
rl.on("close", function() {
    sys.puts("");
    process.exit(0);
});

rl.prompt();
