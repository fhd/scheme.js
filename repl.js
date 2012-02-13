var args = process.argv.slice(2),
    scheme = require("./scheme.js"),
    env = new scheme.Environment;

function print(result) {
    var i;

    if (!Array.isArray(result)) {
        console.log(result);
        return;
    }

    for (i = 0; i < result.length; i++)
        console.log(result[i]);
}

function rep(expression) {
    try {
        print(scheme.eval(expression, env));
    } catch (e) {
        console.error("Error: " + e);
    }
}

function batch(file) {
    var fs = require("fs");
    fs.readFile(file, "utf-8", function(error, data) {
        if (error) {
            console.error(error);
            process.exit(1);
        } else {
            rep(data);
            process.exit(0);
        }
    });
}

function interactive() {
    var readline = require("readline"),
        rl = readline.createInterface(process.stdin, process.stdout);

    rl.setPrompt("=> ");
    rl.on("line", function(cmd) {
        if (cmd.length)
            rep(cmd);
        rl.prompt();
    });
    rl.on("close", function() {
        console.log("");
        process.exit(0);
    });

    rl.prompt();
}

if (args.length)
    batch(args[0]);
else
    interactive();
