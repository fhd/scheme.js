scheme.js
=========

A Scheme implementation in JavaScript.

This is still work in progress, the goal is (near)
[R5RS](http://schemers.org/Documents/Standards/R5RS/) compliance.

Running the REPL
----------------

There are two ways to run a REPL:

### From the browser

Just open _browser-repl/index.html_ in a browser.

### From the command-line

[Node.js](http://nodejs.org) is required.

To start an interactive session:

    node src/repl.js

To process a file:

    node src/repl.js file.scm

Using scheme.js in a website
----------------------------

If you include scheme.js, you can include scheme code via script tags,
just like JavaScript code. Like this:

    <script src="scheme.js"></script>
    <script type="text/scheme">
        ((.alert js) "Hello, World!")
    </script>
    <script type="text/scheme" src="hello.scm"></script>

Using scheme.js in Node.js
--------------------------

You can either execute a scheme file via the REPL:

    node src/repl.js hello.scm

Or evaluate scheme from a JavaScript file:

    var scheme = require("scheme.js");
    scheme.eval('((.log console) "Hello, World!")', new scheme.Environment);

JavaScript interoperabillity
----------------------------

### Getting a property

    (.x y)

In JavaScript, this would be:

    y.x;

### Setting a property

    (set! (.x y) "foo")

In JavaScript, this would be:

    y.x = "foo";

### Calling a function

    ((.log console) "Hello, World!")

In JavaScript, this would be:

    console.log("Hello, World!");

Think if it as retrieving the property _log_ of _console_ and
executing it as a function, which is exactly how it works in
JavaScript.

### Global variables

_js_ refers to the global object, _window_ in the browser and
_globals_ in Node.js.

Running the tests
-----------------

[Node.js](http://nodejs.org) and
[Node Unit](https://github.com/caolan/nodeunit) are required.

You can run the tests like this:

    nodeunit test
