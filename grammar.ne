@{%
const moo = require('./moo')

const token = ([t]) => t.value
const concat = ([d]) => d.join('')

const lexer = moo.states({
	text: {
		newline: { match: '\n', lineBreaks: true },
		linkStart: '[[',
		rightArrow: '->',
		leftArrow: '<-',
		pipe: '|',
		linkEnd: ']]',
		text: { error: true }  // Anything else.
	}
}, 'text')
%}

@lexer lexer

Start -> (Text {% id %} | Link {% id %}):* {% id %}

RightArrow -> %rightArrow {% token %}
LeftArrow -> %leftArrow {% token %}
Pipe -> %pipe {% token %}

PlainText -> (%text {% token %} | %newline {% token %}):+ {% concat %}
NoArrows -> (PlainText | Pipe):+ {% concat %}
NoRightArrow -> (PlainText | Pipe | LeftArrow):+ {% concat %}
LinkText -> (PlainText | Pipe | LeftArrow | RightArrow):+ {% concat %}

Link -> %linkStart LinkContents %linkEnd  {% ([_,link,__]) => link %}

LinkContents ->
	PlainText
		{% ([link]) => ({n:'link',a:[link]}) %}
	| LinkText %rightArrow NoRightArrow
		{% ([text,to,link]) => ({n:'link',a:[link,text]}) %}
	| NoArrows %leftArrow NoRightArrow
		{% ([link,from,text]) => ({n:'link',a:[link,text]}) %}
	| NoArrows %pipe PlainText
		{% ([text,to,link]) => ({n:'link',a:[link,text]}) %}

