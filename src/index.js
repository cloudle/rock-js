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

const source2 = `
fib = λ(n) if n < 2 then n else fib(n - 1) + fib(n - 2);

print("fib(10): ");
time( λ() println(fib(10)) );
print("fibJS(10): ");
time( λ() println(fibJS(10)) );

println("---");

print("fib(20): ");
time( λ() println(fib(20)) );
print("fibJS(20): ");
time( λ() println(fibJS(20)) );

println("---");

print("fib(27): ");
time( λ() println(fib(27)) );
print("fibJS(27): ");
time( λ() println(fibJS(27)) );
`;

module.exports = () => {
	const ast = parse(TokenStream(InputStream(source2))),
		globalEnv = new Environment();

	globalEnv.def('print', (content) => process.stdout.write(`${content}`));
	globalEnv.def('println', (content) => console.log(content));
	globalEnv.def("fibJS", function fibJS(n){
		if (n < 2) return n;
		return fibJS(n - 1) + fibJS(n - 2);
	});
	globalEnv.def("time", function(fn){
		var t1 = Date.now();
		var ret = fn();
		var t2 = Date.now();
		console.log("Time: " + (t2 - t1) + "ms");
		return ret;
	});
	evaluate(ast, globalEnv);
	// console.log(tokenStream.peek());
	// while (next = tokenStream.next()) console.log(next);
	// console.log(parse(tokenStream).program);
	// 	const lexer = new Lexer();
	// 	console.log(lexer.tokenize(
	// `console.log "hello-world"`));
};
