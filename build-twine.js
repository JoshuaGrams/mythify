const asbundle = require('asbundle')
const babel = require('babel-core')
const CleanCSS = new (require('clean-css'))({level: 2})
const fs = require('fs')
const replace = require('replacestream')
const uglify = require('uglify-js')
const Stream = require('stream')

const report = console.log || function(msg) {}


//--------------------------------------------------------------
// Helper functions.

var minification = false

var babelOptions = JSON.parse(fs.readFileSync('.babelrc'))

function compressJS(code) {
	if(!minification) return code
	var minified = uglify.minify(code)
	if(typeof minified.error === 'undefined') {
		return minified.code
	} else {
		report(minified.error)
		return ''
	}
}

function bundleJS(source) {
	try {
		var bundle = asbundle(source)
		var compat = babel.transform(bundle, babelOptions).code
		if(!minification) return compat
		var minified = compressJS(compat)
		return minified
	} catch(e) {
		if(e.code === "ENOENT") return ''; else throw e
	}
}

function minifyCSS(filename) {
	try {
		var source = fs.readFileSync(filename)
		if(!minification) return source
		var min = CleanCSS.minify(source)
		if(min.errors.length > 0 || min.warnings.length > 0) {
			for(let i=0; i<min.errors.length; ++i) {
				report(min.errors[i])
			}
			for(let i=0; i<min.warnings.length; ++i) {
				report(min.warnings[i])
			}
		}
		if(min.errors.length === 0) return min.styles
	} catch(e) {
		report(e);  return ''
	}
}

function collectString(stream, finished) {
	const chunks = []
	stream.on('data', chunk => chunks.push(chunk))
	stream.on('end', () => finished(chunks.join('')))
	stream.on('error', e => { throw e })
}

//--------------------------------------------------------------
// Build Twine story format.

require('./build-grammar')

// Syntax highlighting.
var highlight = bundleJS('twine-highlight.js')
report('compiled twine-highlight.js')

// Insert the engine and CSS into the HTML template.
var engine = bundleJS('twine.js')
fs.writeFileSync('twine.bundle.js', engine)
report('compiled twine.js (runtime engine) to twine.bundle.js')
var css = minifyCSS('twine.css')
report('minified twine.css')
collectString(fs.createReadStream('twine.html')
	.pipe(replace(/"!(?:CSS|ENGINE)!"/g, function() {
		if(arguments[0] === '"!ENGINE!"') return engine
		else if(arguments[0] === '"!CSS!"') return css
	})),  buildFormat)

// Insert the template and highlighter into the story format.
function buildFormat(template) {
	report('inserted engine and css into twine.html template')
	var f = compressJS(fs.readFileSync('twine-format.js', 'utf8'))
	var format = new Stream.Readable()
	format.push(f)
	format.push(null)
	format.pipe(replace(/"!(?:SOURCE|SETUP)!"/g, function() {
			if(arguments[0] === '"!SOURCE!"') {
				return JSON.stringify(template)
			} else if(arguments[0] === '"!SETUP!"') {
				return JSON.stringify(highlight)
			}
	})).pipe(fs.createWriteStream('dist/format.js'))
	report('compiled twine-format.js to dist/format.js')
	report('\t(inserting html template and syntax highlighter code)')
}
