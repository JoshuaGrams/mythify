const test = require('tape')
const nearley = require('nearley')
const grammar = require('./grammar.js')

function formatResult(r) {
	if(typeof r === 'string') return JSON.stringify(r)
	else return r.n + '(' + r.a.map(formatResult).join(', ') + ')'
}

function parse(str) {
	let parser = new nearley.Parser(grammar)
	parser.feed(str)
	return parser.results
}

function parsesTo(t, str, expected) {
	let results = parse(str)
	t.equal(results.length, 1, 'unambiguous parse')
	let actual = results[0]
	t.equal(actual.length, expected.length, 'correct number of results')
	const n = Math.max(actual.length, expected.length)
	for(let i=0; i<n; ++i) {
		t.deepEqual(actual[i], expected[i])
	}
}

test('Links and text', function(t) {
	parsesTo(t, 'foo [[bar]]  [[xyzzy->baz->foo]] [[quux<-plugh]]', [
		'foo ', {n: 'link', a: ['bar']},
		'  ', {n: 'link', a: ['foo', 'xyzzy->baz']},
		' ', {n: 'link', a: ['quux', 'plugh']}
	]);
	parsesTo(t, '[[a|b<-c->d]]', [{n: 'link', a: ['d', 'a|b<-c']}])
	parsesTo(t, '[[a<-b|c<-d]]', [{n: 'link', a: ['a', 'b|c<-d']}])
	parsesTo(t, '[[a|b|c|d]]', [{n: 'link', a: ['d', 'a|b|c']}])
	t.end()
})
