scheme.js
=========

Scheme for the browser and [Node.js](http://nodejs.org). You can
[try it right now](http://fhd.github.com/scheme.js/).

This is still work in progress, the goal is (near)
[R5RS](http://schemers.org/Documents/Standards/R5RS/) compliance.
Have a look at the
[TODO](https://github.com/fhd/scheme.js/blob/master/TODO.md) to see
what's on the agenda.

Running the REPL
----------------

### In the browser

Just open _browser-repl/index.html_ in a browser.

### On the command-line

Node.js is required.

To start an interactive session:

    repl/schemejs

To process a file:

    repl/schemejs file.scm

You can also install the REPL to /usr/local/bin like this:

    make install

Building scheme.js
------------------

Build it like this:

    make

This will put _dist/scheme.js_ in place.

_This step isn't really required yet because scheme.js is just one
source file anyway. But it won't be for long. Plus there will be a
minified version_.

Using scheme.js in a website
----------------------------

If you include _dist/scheme.js_, you can include scheme code via
script tags, just like JavaScript code. Like this:

    <script src="scheme.js"></script>
    <script type="text/scheme">
        ((.alert js) "Hello, World!")
    </script>
    <script type="text/scheme" src="hello.scm"></script>

Using scheme.js in Node.js
--------------------------

You can either execute a scheme file via the REPL:

    repl/schemejs hello.scm

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

Think of it as retrieving the property _log_ of _console_ and
executing it as a function, which is exactly how it works in
JavaScript.

### Global variables

_js_ refers to the global object, _window_ in the browser and
_globals_ in Node.js.

Running the tests
-----------------

Node.js and [Node Unit](https://github.com/caolan/nodeunit) are
required.

You can run the tests like this:

    nodeunit test
