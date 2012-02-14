scheme.js
=========

A Scheme implementation in JavaScript.

This is still work in progress, the goal is (near) R5RS compliance.

Running the REPL
----------------

There are two rays to run a REPL:

### From the browser

Just open _browser-repl/index.html_ in a browser.

### From the command-line

[Node.js](http://nodejs.org) is required.

To start an interactive session:

    node repl.js

To process a file:

    node repl.js file.scm

Using scheme.js in a website
----------------------------

If you include scheme.js, you can include scheme code via script tags,
just like JavaScript code. Like this:

    <script src="scheme.js"></script>
    <script type="text/scheme">
        (.alert js "Hello, World!")
    </script>
    <script type="text/scheme" src="hello.scm"></script>

_js_ refers to the global object, _window_ in the browser.

Using scheme.js in Node.js
--------------------------

You can either execute a scheme file via the REPL:

    node repl.js hello.scm

Or evaluate scheme from a JavaScript file:

    var scheme = require("./scheme.js");
    scheme.eval('(.log console "Hello, World!")', new scheme.Environment);

Calling JavaScript functions
----------------------------

You can call a JavaScript function, e.g. console.log, like this:

    (.log console "Hello, World!")

In JavaScript, this would look like this:

    console.log("Hello, World!");

Running the tests
-----------------

[Node.js](http://nodejs.org) and
[Node Unit](https://github.com/caolan/nodeunit) are required.

You can run the tests like this:

    nodeunit tests.js
