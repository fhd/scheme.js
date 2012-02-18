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

Node.js and
[Commander.js](https://github.com/visionmedia/commander.js/) are
required.

To start an interactive session:

    bin/schemejs

To process a file:

    bin/schemejs file.scm

You can also install the REPL to /usr/local/bin like this:

    make install

Building scheme.js
------------------

Build it like this:

    make

This will put _dist/scheme.js_ and _dist/scheme.min.js_ in place. The
latter only if you have [UglifyJS](https://github.com/mishoo/UglifyJS)
installed.

Using scheme.js in a website
----------------------------

If you include _dist/scheme.js_ or _dist/scheme.min.js_, you can
include scheme code via script tags, just like JavaScript code. Like
this:

    <script src="scheme.min.js"></script>
    <script type="text/scheme">
        ((.alert js) "Hello, World!")
    </script>
    <script type="text/scheme" src="hello.scm"></script>

Using scheme.js in Node.js
--------------------------

You execute a scheme file via the REPL:

    bin/schemejs hello.scm

Or evaluate Scheme from JavaScript:

    var scheme = require("./scheme.min.js");
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

### Creating JavaScript objects

You can create new JavaScript objects from an alist with the
_make-object_, like this:

    (make-object (("hello" "world") ("foo" "bar")))

This will become:

    {"hello: "world, "foo": "bar"}

### Instantiating JavaScript functions

    (new (.Date js) 2012 1 19)

In JavaScript, this would be:

    new Date(2012, 1, 19);

### Exceptions

    (try (...) (lambda (e) ...))

In JavaScript, this would be:

    try { ... } catch (e) { ... }

Compiling Scheme to JavaScript
------------------------------

You can compile Scheme code to JavaScript that will evaluate itself
when loaded.

    bin/schemejs -c hello.scm > hello.scm.js

You can include the resulting script file in your page:

    <script src="scheme.min.js"></script>
    <script src="hello.scm.js"></script>

And like this in Node.js:

    var scheme = require("./scheme.min.js");
    require("./hello.scm.js");

Note that you have to load scheme.js before the script. If you want a
really self-contained JS file, do this:

    cp scheme.min.js hello.js
    bin/schemejs -c hello.scm >> hello.js

In any event, the code evaluates itself with the environment from the
global variable _environment_. If the variable exists, it uses that,
otherwise a fresh environment is created. So if you add several
compiled source files they will automatically use the same
environment.

This isn't compilation in the proper sense: The result is just the
parsed Scheme code in JavaScript data structures, wrapped in a _eval_
call. It is still interpreted at runtime.

Running the tests
-----------------

Node.js and [Node Unit](https://github.com/caolan/nodeunit) are
required.

You can run the tests like this:

    nodeunit test
