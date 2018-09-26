import compile from './transpiler';
import { Lexer } from './transpiler/lexer';

const sourceCode = 'mul 3 sub 2 sum 1 3 4';

module.exports = () => {
	// console.log(compile(sourceCode));
	const lexer = new Lexer();
	console.log(lexer.tokenize(
`console.log "hello-world"`));
};
