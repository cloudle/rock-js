import { InputStream } from './compiler/lexer';
import { TokenStream } from './compiler/tokenizer';
import parse from './compiler/parser';

const sourceCode = `{
let x = 1 + 1;
let y = x + 1;
handSome = true;
log(y);
}`;

module.exports = () => {
	let next;
	const tokenStream = TokenStream(InputStream(sourceCode));
	// console.log(tokenStream.peek());
	// while (next = tokenStream.next()) console.log(next);
	console.log(parse(tokenStream).program);
// 	const lexer = new Lexer();
// 	console.log(lexer.tokenize(
// `console.log "hello-world"`));
};
