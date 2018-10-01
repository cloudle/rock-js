import { InputStream, TokenStream, parse } from './compiler/lexer';

const sourceCode = `let userName = "Cloud"`;

module.exports = () => {
	let next;
	const tokenStream = TokenStream(InputStream(sourceCode));
	// while (next = tokenStream.next()) console.log(next);
	console.log(parse(tokenStream));
// 	const lexer = new Lexer();
// 	console.log(lexer.tokenize(
// `console.log "hello-world"`));
};
