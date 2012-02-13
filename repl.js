var args = process.argv.slice(2),
    scheme = require("./scheme.js"),
    env = new scheme.Environment;

function batch(file) {
    var fs = require("fs");
    fs.readFile(file, "utf-8", function(error, data) {
        if (error) {
            console.error(error);
            process.exit(1);
        } else {
            console.log(scheme.eval(data, env));
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
            try {
                console.log(scheme.eval(cmd, env));
            } catch (e) {
                console.log("Error: " + e);
            }
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
