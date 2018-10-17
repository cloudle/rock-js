export const Program = Symbol('program');
export const Lambda = Symbol('lambda');
export const Operator = Symbol('operator');
export const Number = Symbol('num');
export const String = Symbol('string');
export const Boolean = Symbol('boolean');
export const Call = Symbol('call');
export const If = Symbol('if');
export const Keyword = Symbol('keyword');
export const Identifier = Symbol('identifier');
export const Let = Symbol('let');
export const Punctuation = Symbol('punctuation');
export const Indent = Symbol('indent');
export const Assign = Symbol('assign');
export const Binary = Symbol('binary');

export const FALSE = { type: Boolean, value: false };
export const TRUE = { type: Boolean, value: true };
export const PRECEDENCE = {
	'=': 1,
	'||': 2,
	'&&': 3,
	'<': 7, '>': 7, '<=': 7, '>=': 7, '==': 7, '!=': 7,
	'+': 10, '-': 10,
	'*': 20, '/': 20, '%': 20,
	'|>': 22, '.': 22,
};

export const keywords = [
	'const', 'let',
	'lambda', 'λ',
	'if', 'unless', 'else', 'then',
	'for', 'while', 'until',
	'switch', 'when', 'do', 'default',
	'new', 'try', 'catch', 'finally',
	'class', 'extends', 'constructor',
	'yield', 'await',
];

export const operatorAliases = {
	and: '&&',
	or: '||',
	is: '==',
	isnt: '!=',
	not: '!',
};

export const identifierAlias = {
	yes: 'true',
	on: 'true',
	no: 'false',
	off: 'false',
};

export const tokens = [
	'(', ')', '[', ']', '{', '}', '.', ',', '?', ':', '@', '#',
	'&&', '||', '==', '!=', '<>',
	'true', 'false', 'in', 'of', 'from',
	...Object.keys(operatorAliases),
	...Object.keys(identifierAlias),
];

export const operators = [
	'+', '-', '*', '/', '+=', '-=', '*=', '/=',
	'++', '--',
	'->', '<-', '=>', '|>', '..', '...', '++', '/g',
	'?=', '?.'
];
