// Twine uses CodeMirror for its passage editor.

// See https://codemirror.net/doc/manual.html#modeapi

CodeMirror.defineMode('name', function(editorOpts, modeOpts) {
	return {
		token: function(lineStream, ourState) {
		},
		// Needed if `token` uses `ourState`.
		startState: function() {
			return {}
		},
		// Needed if you want to do custom indenting.
		indent: function(state, textAfter) {
			var numSpaces = 0
			return numSpaces
		}
	}
})
