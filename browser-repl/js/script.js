$(function() {
    var env = new scheme.Environment,
        shell = $("#shell");
    shell.console({
        promptLabel: "=> ",
        commandHandle: function(line) {
            if (!line.length)
                return "";
            try {
                return scheme.print(scheme.eval(scheme.read(line), env));
            } catch (e) {
                return "Error: " + e;
            }
        },
        autofocus: true,
        animateScroll: true,
        promptHistory: true
    });
});
