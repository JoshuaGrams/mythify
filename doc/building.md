Build Process
=============

* `npm run grammar` builds the grammar from the `grammar.ne` source.
* `npm run twine` builds the Twine 2 story format.
* `npm test` runs the tests.


Files
-----

* `grammar.ne` describes the syntax of story scripts.

* `grammar.js` is the compiled form of the grammar.

* `twine-format.js` describes the Twine story format.

* `twine.js` is the Twine runtime engine which displays passages
  and handles links and so on.

* `twine.css` is the default style for the Twine story format.

* `twine.html` is the template that Twine will insert its story
  data into.   It includes `twine.js` and `twine.css`.

* `twine-highlight.js` is an optional file which provides syntax
  highlighting within the Twine editor.  It calls
  `CodeMirror.defineMode` to define a syntax highlighting mode
  named the same as the story format.


Dependencies
------------

* `nearley` is a Earley parser library.

* `moo` is a Regexp-based lexer.  I've included the source
  rather than depending on it because I'm using a slightly
  modified version.


Build Dependencies
------------------

* `asbundle` recursively packs dependencies into a single file.

* `clean-css` minifies CSS code.

* `babel-core` converts modern javascript to browser-compatible
  javascript.  The conversion code is in the `babel-preset-env`
  package.

* `uglify-js` minifies javascript code.

* `replacestream` finds and replaces text within a `node.js`
  stream (run from javascript code).  This is used to insert the
  HTML `source` template and the syntax highlighting `setup`
  code into our Twine story `format.js`.

-----

* `tape` is a simple test runner.

* `faucet` provides a prettier version of the test output.
