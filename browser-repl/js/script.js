$(function() {
    var env = new scheme.Environment,
        shell = $("#shell");
    shell.console({
        promptLabel: "=> ",
        commandHandle: function(line) {
            console.log(line);
            if (!line.length)
                return "";
            try {
                return "" + scheme.eval(line, env);
            } catch (e) {
                return "Error: " + e;
            }
        },
        autofocus: true,
        animateScroll: true,
        promptHistory: true
    });
});
