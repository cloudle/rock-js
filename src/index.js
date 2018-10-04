import { InputStream } from './compiler/lexer';
import { TokenStream } from './compiler/tokenizer';
import parse from './compiler/parser';

const sourceCode = `
print_range = λ(a, b) if a <= b {
                        print(a);
                        if a + 1 <= b {
                          print(", ");
                          print_range(a + 1, b);
                        } else println("");
                      };
print_range(1, 10);
`;

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
