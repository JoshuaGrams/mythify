const fs = require('fs')

const report = console.log || function(msg) {}

const nearley = require('nearley')
const compile = require('nearley/lib/compile')
const generate = require('nearley/lib/generate')
const nearleyGrammar = require('nearley/lib/nearley-language-bootstrapped')

function compileGrammar(code) {
	const opts = {
		version: require('nearley/package.json').version
	}
	const parser = new nearley.Parser(nearleyGrammar)
	parser.feed(code)
	return generate(compile(parser.results[0], opts), 'grammar')
}

// -------------------------------------------------------------

var ne = fs.readFileSync('grammar.ne', 'utf8')
var js = compileGrammar(ne)
fs.writeFileSync('grammar.js', js, 'utf8')
report('compiled grammar.ne to grammar.js')
