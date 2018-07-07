Design
======

I want this to work as:

* A story compiler producing standalone web (or glulx?) games.

* A Twine story format.

* Ink-like narrative middleware to be built into games using
  other engines (e.g. Unity and so on).

Running as a Twine story format means we need to be able to
interpret raw text on the fly in the web browser.

Running as middleware means we need a highly portable runtime.
And the parser/interpreter is probably not as simple to port as
I'd like.  So we want to be able to compile the code to a data
or bytecode format with a tiny runtime evaluator that can be
easily ported to any platform.

The stand-alone version can either compile the code and include
the simple runtime (better for file size, bandwidth, and load
times) or be like Twine and include the raw passage text and the
full parser/interpreter.  If it does compilation, it could also
potentially perform as a linker or optimizer and leave out
unused portions of the engine.


Twine Story Format
------------------

Twine runs CodeMirror.  So syntax highlighting (currently only
implemented by the default Harlowe format) follows the
CodeMirror conventions.

A story format is simply a javascript file (traditionally called
`format.js`) which calls `window.storyFormat(formatConfig)`,
where `formatConfig` is an object containing:

* `name` of story format.
* `version` string.
* `author` name.
* `description` text.
* `image` url for an icon, if desired.
* `url` for its webpage.
* `license` type.
* Is this a `proofing` format? (boolean)
* `source` HTML file.
* Syntax highlighting `setup` function.

The `source` HTML file contains inline javascript for the story
interpreter, plus `{{STORY_NAME}}` and `{{STORY_DATA}}` markers
which will be replaced with the story's name and contents when
you publish to a file.

The `setup` function will call `CodeMirror.defineMode(name,
constructor)`.  On loading, CodeMirror will call
`constructor(editorConfig, modeConfig)`.  Modes normally do not
get access to the editor object, only its configuration.  But
Twine adds a an editor reference, so you can access it as
`CodeMirror.modes[name].cm`.

A CodeMirror mode is an object with:

* `token(line, state) -> token`
* [optional] `startState() -> state`
* [optional] `copyState(state) -> state'`
* [optional] `indent(state, textAfter) -> #spaces`
* [optional] `blankLine(state)` - called when a blank line was
  skipped.
* [optional] `electricChars` - string: chars which trigger a
  re-indent.
* [optional] `electricInput` - regex: trigger a re-indent.
  Should usually end with a `$` so it doesn't trigger in the
  middle of a line?

The `line` argument to `token` is a stream containing the text
up until the end of the line.  It has a whole bunch of methods:

* `eol() -> boolean` - Are we at the end of the line?
* `sol() -> boolean` - Are we at the start of the line?
* `peek() -> string` - Peek at the next character (`null` at
  `eol`).
* `next() -> string` - Get the next character.
* `eat(match) -> string` - Eat the next character if it matches.
  Takes a string, regex, or `function(string) -> boolean`.
* `eatWhile(match) -> boolean` - Calls `eat` until it fails.
  Returns true if any characters were eaten.
* `eatSpace() -> boolean` - `eatWhile(/\s/)`.
* `skipToEnd()` - Advance to end of line.
* `skipTo(string) -> boolean` - Skip to next occurrence, or do
  nothing if no match found.
* `match(string, consume=true, caseInsensitive=true) -> boolean`
  - Multi-character `eat` or `peek`.
* `match(regex, consume=true) -> array(string)` - As above, but
  with regex.  Returns the array of submatches.
* `backUp(n)` - back up n characters.  Will break if you back up
  past the start of the token.
* `column() -> integer` - current column (CodeMirror does the
  stupid convert-tabs-to-spaces thing).
* `indentation() -> integer` - indentation of current line.
* `current() -> string` - current token (from start to current
  position).
* `lookAhead(n) -> string? - Get the line `n` lines after the
  current one.

It's not yet clear to me how the `indent` method works.  Is
`textAfter` the *whole* text of the line including whitespace?
Is it the whole line with tabs converted to spaces?  Does it
have the whitespace stripped?  If so, do you just have to rely
on the state?  So you would indent if the last line ends in an
`if:` (Python) or `{` (Algol-style languages)?  An indentation
method may return `CodeMirror.Pass` to indicate that it didn't
have an answer.

`CodeMirror.defineSimpleMode` is a more declarative interface
for simple highlighting, but I suspect Twine doesn't include
that add-on.

The [CodeMirror default theme][1] has the following syntax
highlighting classes.  I've added comments about how many of the
options in `themes/` support the style.  I've also bolded the
ones which Twine's themes support.

* `cm-header`       (16/54)
* `cm-quote`        (9/54)
* --
* **`cm-keyword`**    (all)
* **`cm-atom`**       (all)
* **`cm-number`**     (52/54)
* **`cm-def`**        (51/54)
* **`cm-variable`**   (all)
* `cm-punctuation`    (3/54)
* **`cm-property`**   (43/54)
* `cm-operator`       (30/54)
* **`cm-variable-2`** (51/54)
* `cm-variable-3`     (34/54)
* `cm-type`           (32/54)
* **`cm-comment`**    (all)
* **`cm-string`**     (all)
* `cm-string-2`       (25/54)
* `cm-meta`           (33/54)
* `cm-qualifier`      (30/54)
* `cm-builtin`        (36/54)
* **`cm-bracket`**    (39/54)
* **`cm-tag`**        (50/54)
* **`cm-attribute`**  (50/54)
* `cm-hr`             (12/54)
* **`cm-link`**       (38/54)
* --
* **`cm-error`**      (44/54)

The 14 classes in (`twinejs/src/vue/codemirror-theme.less`) are:

* keyword
* atom
* number
* def
* variable
* property
* variable-2
* comment
* string
* bracket
* tag
* attribute
* link
* error

This is supposedly based on Chris Kempson's [Base16 styling
guidelines][2].  But they've totally rearranged them.  Ah, I
see.  They just grabbed them directly from the link they gave,
idleberg's base16-codemirror repository, and *he* has them all
screwed up from the originals.  Weird.

* Base00 - #1d1f21 - Default Background
* Base01 - #282a2e - Lighter Background (Used for status bars).
* Base02 - #373b41 - Selection Background
* Base03 - #979896 - Comments, Invisibles, Line Highlighting.
* Base04 - #b4b7b4 - Dark Foreground (Used for status bars).
* Base05 - #c5c8c6 - Default Foreground, Caret, Delimiters, Operators.
* Base06 - #e0e0e0 - Light Foreground (Not often used).
* Base07 - #ffffff - Light Background (Not often used).
* Base08 - #cc6666 - Variables, XML Tags, Markup Link Text, Markup Lists, Diff Deleted.
* Base09 - #de935f - Integers, Boolean, Constants, XML Attributes, Markup Link URL.
* Base0A - #f0c674 - Classes, Markup Bold, Search Text Background.
* Base0B - #b5bd68 - Strings, Inherited Class, Markup Code, Diff Inserted.
* Base0C - #8abeb7 - Support, Regular Expressions, Escape Characters, Markup Quotes.
* Base0D - #81a2be - Functions, Methods, Attribute IDs, Headings.
* Base0E - #b294bb - Keywords, Storage, Selector, Markup Italic, Diff Changed.
* Base0F - #a3685a - Deprecated, Opening/Closing Embedded Language Tags, e.g. `<?php ?>`.


Twine's dark theme has:

* 00 (default bg) as gutter bg.
* 01 (status bar bg) N/A
* 02 (selection bg) N/A
* 03 (comments) for line numbers.
* 04 (status bar fg) for cursor.
* 05 (default fg) N/A
* 06 (light fg) as default fg.
* 07 (light bg) N/A
* 08 (variables) for keywords.
* 09 (literals) for definitions.
* 0A (classes) for strings.
* 0B (strings) for variables, properties, and attributes.
* 0C (other literals) N/A
* 0D (functions) for variable-2
* 0E (keywords) for number, atom.
* 0F (language boundaries) for comments.

Then they grab 05 (default fg) from the *light* base16 tomorrow
theme for the selection background.  Which approximately
corresponds to the dark base16 02 (selection bg), so that works.


Twine's light theme has:

* 00 (default bg) as gutter bg.
* 01 (status bar bg) N/A
* 02 (selection bg) as selection bg.
* 03 (comments) N/A
* 04 (status bar fg) for cursor.
* 05 (default fg) N/A
* 06 (light fg) as default fg.
* 07 (light bg) N/A

Other than that it uses the same as the dark theme.

It grabs 04 from the *dark* base16 tomorrow theme for the line
numbers.  Which, again, is close to where 03 (comments) *should*
be (03 and 04 are switched in the light base16 tomorrow theme),
so it's OK.

[2]: https://github.com/chriskempson/base16/blob/master/styling.md

In general with CodeMirror, you're totally safe with `keyword`,
`atom`, `variable`, `comment`, and `string`.  You're reasonably
safe with `number`, `def`, `property`, `variable-2`, `tag`,
`attribute`, and `error`.  I'm a little surprised at the
popularity of `tag` and `attribute`, but I guess it *is* a
browser-based editor, so HTML is a natural fit.

[1]: https://github.com/codemirror/CodeMirror/blob/master/lib/codemirror.css
