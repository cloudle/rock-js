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

export const tokens = [
	'(', ')', '[', ']', '{', '}', '.', ',', '?', ':', '@', '#',
	'and', '&&', '||', 'or', 'is', '==', 'is', 'isnt', 'not', '!=', '<>',
	'true', 'yes', 'on', 'false', 'no', 'off', 'in', 'of', 'from'
];

export const operators = [
	'+', '-', '*', '/', '+=', '-=', '*=', '/=',
	'++', '--',
	'->', '<-', '=>', '|>', '..', '...', '++', '/g',
	'?=', '?.'
];
