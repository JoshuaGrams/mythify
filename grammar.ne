@{%
const moo = require('./moo')

const lexer = moo.states({
	text: {
		newline: { match: '\n', lineBreaks: true },
		linkStart: '[[',
		pipe: '|',
		rightArrow: '->',
		leftArrow: '<-',
		linkEnd: ']]',
		text: { error: true }  // Anything else.
	}
}, 'text')
%}

@lexer lexer

Start -> (Text {% id %} | Link {% id %}):* {% id %}

TextToken ->
	  %text {% ([t]) => t.value %}
	| %newline {% ([t]) => t.value %}

Text -> TextToken:+ {% ([d]) => d.join('') %}

Link ->
	  %linkStart Text %linkEnd
		{% ([_,link,__]) => ({n:'link',a:[link]}) %}
	| %linkStart Text %pipe Text %linkEnd
		{% ([_,text,to,link, __]) => ({n:'link',a:[link,text]}) %}
	| %linkStart Text %rightArrow Text %linkEnd
		{% ([_,text,to,link,__]) => ({n:'link',a:[link,text]}) %}
	| %linkStart Text %leftArrow Text %linkEnd
		{% ([_,link,from,text,__]) => ({n:'link',a:[link,text]}) %}
