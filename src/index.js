import compile from './transpiler';
import { Lexer } from './transpiler/lexer';

const sourceCode = 'sum 3 3 2';

module.exports = () => {
	console.log(compile(sourceCode));
// 	const lexer = new Lexer();
// 	console.log(lexer.tokenize(
// `console.log "hello-world"`));
};
