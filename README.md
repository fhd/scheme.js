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

Running the tests
-----------------

[Node.js](http://nodejs.org) and
[Node Unit](https://github.com/caolan/nodeunit) are required.

You can run the tests like this:

    nodeunit tests.js
