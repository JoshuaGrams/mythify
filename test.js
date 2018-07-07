const nearley = require('nearley')
const grammar = require('./grammar.js')

var parser = new nearley.Parser(grammar)
parser.feed('foo [[bar]]  [[xyzzy->baz]] [[quux<-plugh]]')
for(let i=0; i<parser.results.length; ++i) {
	console.log(JSON.stringify(parser.results[i]))
}
