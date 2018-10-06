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

cons = λ(x, y)
         λ(a, i, v)
           if a == "get"
              then if i == 0 then x else y
              else if i == 0 then x = v else y = v;

car = λ(cell) cell("get", 0);
cdr = λ(cell) cell("get", 1);
set-car! = λ(cell, val) cell("set", 0, val);
set-cdr! = λ(cell, val) cell("set", 1, val);
NIL = λ(f) f(NIL, NIL);

foreach = λ(list, f)
	if list != NIL {		
		f(car(list));
		foreach(cdr(list), f);
	};

range = λ(a, b) if a <= b then cons(a, range(a + 1, b)) else NIL;

foreach(range(1, 8), λ(x) println(x * x));
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
