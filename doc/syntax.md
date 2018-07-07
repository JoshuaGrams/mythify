Syntax
======

Twine
-----

Twine wraps the text of each passage in a `tw-passage` tag.  All
interpretation is done by the story format.

But it does *recognize* links in order to create new passages
and draw arrows between them.  Links are delimited by double
square brackets, and there are several forms of what can happen
inside them.

* `[[passage name]]`
* `[[text|passage]]` - uses last `|`.
* `[[text->passage]]` - uses last `->`.
* `[[passage<-text]]` - uses first `<-`.
* `[[link][code]]` - uses first `][`, combines with any of the
  above link types.  SugarCube uses this format to update
  variables when a link is clicked.

Harlowe
-------

Harlowe has commands in parentheses: `(cmd: arg1, arg2, ...)`
(it calls them "macros").  If a command is followed by a block
of text enclosed in single square brackets, it can modify that
text (e.g. `(color: red) [This is some red text]`).

Harlowe calls these marked text blocks "hooks", and they can
also be named and referred to elsewhere, using a syntax that is
supposed to look like a gift tag:

* `|name>[This is some text]`
* `[This is some text]<name|`

Note that this only works with commands which are designed to
take a hook name.
