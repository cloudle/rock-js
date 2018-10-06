import { InputStream } from './compiler/lexer';
import { TokenStream } from './compiler/tokenizer';
import parse from './compiler/parser';
import { Environtment } from './compiler/environment';
import { evaluate } from './compiler/evaluate';

const sourceCode = `
print_range = λ(a, b) if a <= b {
                        print(a);
                        if a + 1 <= b {
                          print(", ");
                          print_range(a + 1, b);
                        } else println("");
                      };
sum = lambda(x, y) x + y;
print_range(1, 10);
print(sum(3, 3));
print(sum(3, 10));
`;

module.exports = () => {
	const code = "sum = lambda(x, y) x + y; print(sum(3, 3));",
		ast = parse(TokenStream(InputStream(sourceCode))),
		globalEnv = new Environtment();

	globalEnv.def('print', (content) => console.log(content));
	evaluate(ast, globalEnv);

	// console.log(tokenStream.peek());
	// while (next = tokenStream.next()) console.log(next);
	// console.log(parse(tokenStream).program);
// 	const lexer = new Lexer();
// 	console.log(lexer.tokenize(
// `console.log "hello-world"`));
};
