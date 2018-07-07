Build Process
=============

* `npm grammar` builds the grammar from the `mythify.ne` source.
* `npm twine` builds the Twine 2 story format.

Build Dependencies
------------------

* `asbundle` recursively packs dependencies into a single file.

* `clean-css` minifies CSS code.

* `babel-core` converts modern javascript to browser-compatible
  javascript.  The conversion code is in the `babel-preset-env`
  package.

* `moo` is a Regexp-based lexer.  I've included the source
  rather than depending on it because I'm using a slightly
  modified version.

* `nearley` is a Earley parser library.

* `replacestream` finds and replaces text within a `node.js`
  stream (run from javascript code).  This is used to insert the
  HTML `source` template and the syntax highlighting `setup`
  code into our Twine story `format.js`.

* `uglify-js` minifies javascript code.
