import lexer from './lexer';
import parse from './parser';
import transpile from './transpiler';

export default function(source) {
	return transpile(parse(lexer(source)));
}
