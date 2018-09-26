export const MATCHES = {
	IDENTIFIER: /^(?!\d)((?:(?!\s)[$\w\x7f-\uffff])+)([^\n\S]*:(?!:))?/,
	STRING_START: /^(?:'''|"""|'|")/,
	STRING_SINGLE: /^(?:[^\\']|\\[\s\S])*/,
	STRING_DOUBLE: /^(?:[^\\"#]|\\[\s\S]|\#(?!\{))*/,
	HEREDOC_SINGLE: /^(?:[^\\']|\\[\s\S]|'(?!''))*/,
	HEREDOC_DOUBLE: /^(?:[^\\"#]|\\[\s\S]|"(?!"")|\#(?!\{))*/,
	NUMBER: /^0b[01]+|^0o[0-7]+|^0x[\da-f]+|^\d*\.?\d+(?:e[+-]?\d+)?/i,
	OPERATOR: /^(?:[-=]>|[-+*\/%<>&|^!?=]=|>>>=?|([-+:])\1|([&|<>*\/%])\2=?|\?(\.|::)|\.{2,3})/,
	WHITESPACE: /^[^\n\S]+/,
	COMMENT: /^\s*###([^#][\s\S]*?)(?:###[^\n\S]*|###$)|^(?:\s*#(?!##[^#]).*)+/,
	MULTI_DENT: /^(?:\n[^\n\S]*)+/,
	TRAILING_SPACES: /\s+$/,
};

export const TOKENS = {
	BOM: 65279,
	COMPOUND_ASSIGN: [
		'-=', '+=', '/=', '*=', '%=', '||=', '&&=', '?=', '<<=', '>>=', '>>>=',
		'&=', '^=', '|=', '**=', '//=', '%%='
	],
	UNARY: ['NEW', 'TYPEOF', 'DELETE', 'DO'],
	UNARY_MATH: ['!', '~'],
	SHIFT: ['<<', '>>', '>>>'],
	COMPARE: ['==', '!=', '<', '>', '<=', '>='],
	MATH: ['*', '/', '%', '//', '%%'],
	RELATION: ['IN', 'OF', 'INSTANCEOF'],
	BOOL: ['TRUE', 'FALSE'],
	UNFINISHED: [
		'\\', '.', '?.', '?::', 'UNARY', 'MATH', 'UNARY_MATH', '+', '-',
		'**', 'SHIFT', 'RELATION', 'COMPARE', '&', '^', '|', '&&', '||',
		'BIN?', 'EXTENDS'],
	RESERVED: [
		'case', 'function', 'var', 'void', 'with', 'const', 'let', 'enum',
		'native', 'implements', 'interface', 'package', 'private',
		'protected', 'public', 'static',
	],
};
