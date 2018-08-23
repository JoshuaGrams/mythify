@{%
// ---------------------------------------------------------------------
// Lexer

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
		codeStart: { match: '{{', push: 'code' },
		text: { error: true }  // Anything else.
	},
	code: {
		identifier: /[a-zA-Z0-9_]\+/,
		addOp: /[+-]/,
		mulOp: /[*\/]/,
		groupStart: '(',
		groupEnd: ')',
		separator: /[,;]/,
		assignment: ':=',
		codeEnd: { match: '}}', pop: true }
	}
}, 'text')

%}

@lexer lexer

# ----------------------------------------------------------------------
# Grammar

# Literal text is parsed to strings.
# Commands are parsed to `{ n: 'name', a: [ arg1, arg2, ... ] }`.

Start -> ( Text {% id %} | Link {% id %} ):* {% id %}


# ----------------------------------------------------------------------

Text -> ( AllDividers | %linkEnd {% token %} ):+ {% concat %}


# ----------------------------------------------------------------------

Link -> %linkStart LinkContents %linkEnd  {% ([_,link,__]) => link %}

LinkContents ->  # In order of priority:
	AllDividers %rightArrow NoRightArrow   # Right-most right arrow
		{% ([text,to,link]) => ({n:'link',a:[link,text]}) %}
	| NoArrows %leftArrow NoRightArrow     # Left-most left arrow
		{% ([link,from,text]) => ({n:'link',a:[link,text]}) %}
	| NoArrows %pipe NoDividers            # Right-most pipe.
		{% ([text,to,link]) => ({n:'link',a:[link,text]}) %}
	| NoDividers                           # All of it.
		{% ([link]) => ({n:'link',a:[link]}) %}

NoDividers   -> (%text {% token %} | %newline {% token %}):+ {% concat %}
NoArrows     -> (NoDividers | Pipe):+ {% concat %}
NoRightArrow -> (NoDividers | Pipe | LeftArrow):+ {% concat %}
AllDividers  -> (NoDividers | Pipe | LeftArrow | RightArrow):+ {% concat %}


# ----------------------------------------------------------------------
# Tokens

RightArrow -> %rightArrow {% token %}
LeftArrow -> %leftArrow {% token %}
Pipe -> %pipe {% token %}
