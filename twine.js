/*
 * Twine runtime: will be inserted into `twine.html`,
 * which will be inserted into `twine-format.js`.
 */

var storyState = {}
var storyFunctions = {}

const Nearley = require('nearley')
var grammar = require('./grammar.js')

var storyData = document.querySelector('tw-storydata')

function selectPassage(key, value) {
	var sel = 'tw-passagedata[' + key + '="' + value + '"]'
	return storyData.querySelector(sel)
}

// Takes a passage name or index or tw-passagedata element.
storyFunctions.display = function(passage) {
	if(typeof passage === 'string') {
		passage = selectPassage('name', passage)
	} else if(typeof passage === 'number') {
		passage = selectPassage('pid', passage)
	}

	var parser = new Nearley.Parser(grammar)
	parser.feed(passage.textContent)

	var passage = parser.results[0]
	for(let i=0; i<passage.length; ++i) {
		var element = passage[i]
		if(typeof element === 'string') {
			element = document.createTextNode(element)
			document.body.appendChild(element)
		} else {
			var fn = storyFunctions[element.n]
			fn.apply(storyState, element.a)
		}
	}
}

function followLink(element) {
	var target = element.getAttribute('data-passage')
	storyFunctions.display(target)
}

storyFunctions.link = function(target, text) {
	text = text || target
	var element = document.createElement('button')
	element.className = 'link'
	element.setAttribute('data-passage', target)
	element.appendChild(document.createTextNode(text))
	element.addEventListener('click', function(e){
		followLink(e.target)
	})
	element.addEventListener('keypressed', function(e) {
		const ENTER = 13, SPACE = 32
		if(e.which === ENTER || e.which === SPACE) {
			followLink(e.target)
		}
	})
	document.body.appendChild(element)
}


// Show the start passage.
storyFunctions.display(parseInt(storyData.getAttribute('startnode')))
