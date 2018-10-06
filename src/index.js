import { InputStream } from './compiler/lexer';
import { TokenStream } from './compiler/tokenizer';
import parse from './compiler/parser';
import { Environment } from './compiler/environment';
import { evaluate } from './compiler/evaluate';

const sourceCode = `
print_range = λ(a, b) 
	if a <= b {
		print(a);
		if a + 1 <= b {
			print(", ");
			print_range(a + 1, b);
		} else println("");
	};

#print_range(1, 9);

cons = λ(a, b) λ(f) f(a, b);
car = λ(cell) cell(λ(a, b) a);
cdr = λ(cell) cell(λ(a, b) b);
NIL = λ(f) f(NIL, NIL);

foreach = λ(list, f)
	if list != NIL {		
		f(car(list));
		foreach(cdr(list), f);
	};

x = cons(1, cons(2, cons(3, cons(4, cons(5, NIL)))));
foreach(x, println);
`;

module.exports = () => {
	const ast = parse(TokenStream(InputStream(sourceCode))),
		globalEnv = new Environment();

	globalEnv.def('print', (content) => process.stdout.write(`${content}`));
	globalEnv.def('println', (content) => console.log(content));
	evaluate(ast, globalEnv);
	// console.log(tokenStream.peek());
	// while (next = tokenStream.next()) console.log(next);
	// console.log(parse(tokenStream).program);
	// 	const lexer = new Lexer();
	// 	console.log(lexer.tokenize(
	// `console.log "hello-world"`));
};
