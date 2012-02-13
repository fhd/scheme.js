function format(result) {
    var formatted;
    if (!$.isArray(result))
        return result + "\n";
    formatted = "";
    $.each(result, function(index, value) {
        formatted += value + "\n";
    });
    return formatted;
}

$(function() {
    var env = new scheme.Environment,
        shell = $("#shell");
    shell.console({
        promptLabel: "=> ",
        commandHandle: function(line) {
            if (!line.length)
                return "";
            try {
                return format(scheme.eval(line, env));
            } catch (e) {
                return "Error: " + e;
            }
        },
        autofocus: true,
        animateScroll: true,
        promptHistory: true
    });
});
