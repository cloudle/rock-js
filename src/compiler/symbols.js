export const Operator = Symbol('op');
export const Number = Symbol('num');
export const String = Symbol('string');
export const Keyword = Symbol('keyword');
export const Identifier = Symbol('identifier');
export const Puntuation = Symbol('punctuation');

export const keywords = [
	'const', 'let',
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
