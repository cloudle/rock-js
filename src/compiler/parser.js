import {
	Call, FALSE, Identifier, Let, If, Keyword, Number, Operator, Assign, Binary,
	PRECEDENCE, Program, Lambda, Punctuation, Indent, String
} from './symbols';

export default function parse(input) {
	let currentIndent = '\n';
	const delimited = (start, stop, separator, parser) => {
		let result = [], first = true;
		skipPunctuation(start);

		while (!input.eof()) {
			if (isPunctuation(stop)) break;
			if (first) first = false; else skipPunctuation(separator);
			if (isPunctuation(stop)) break;
			result.push(parser());
		}

		skipPunctuation(stop);
		return result;
	};

	const indented = (parentIndent, innerIndent, parser) => {
		let result = [];

		while (!input.eof()) {
			if (isIndent(parentIndent)) break;
			if (isIndent(innerIndent)) {
				skipIndent(innerIndent);
				result.push(parser());
			} else break;
		}

		return result;
	};

	const isPunctuation = (char) => {
		const token = input.peek();
		return token && token.type === Punctuation && (!char || token.value === char) && token;
	};

	const isIndent = (value) => {
		const token = input.peek();
		return token && token.type === Indent && (!value || token.value === value) && token;
	};

	const isKeyword = (keyword) => {
		const token = input.peek();
		return token && token.type === Keyword && (!keyword || token.value === keyword) && token;
	};

	const isOperator = (op) => {
		const token = input.peek();
		return token && token.type === Operator && (!op || token.value === op) && token;
	};

	const skipPunctuation = (char) => {
		if (isPunctuation(char)) input.next();
		else input.croak(`Expecting punctuation: "${char}"`);
	};

	const skipIndent = (value) => {
		if (isIndent(value)) input.next();
		else input.croak(`Expecting indent: "${value}"`);
	};

	const skipOperator = (op) => {
		if (isOperator(op)) input.next();
		else input.croak(`Expecting operator: "${op}"`);
	};

	const skipKeyword = (keyword) => {
		if (isKeyword(keyword)) input.next();
		else input.croak(`Expecting keyword: "${keyword}"`);
	};

	const unexpected = () => {
		input.croak(`Unexpected token: ${JSON.stringify(input.peek())}`);
	};

	const maybeCall = (expr) => {
		expr = expr();
		return isPunctuation('(') ? parseCall(expr) : expr;
	};

	const maybeBinary = (left, myPrecedence) => {
		const operator = isOperator();
		if (operator) {
			const hisPrecedence = PRECEDENCE[operator.value];
			if (hisPrecedence > myPrecedence) {
				input.next();
				return maybeBinary({
					type: operator.value === '=' ? Assign : Binary,
					operator: operator.value,
					left,
					right: maybeBinary(parseAtom(), hisPrecedence),
				}, myPrecedence)
			}
		}

		return left;
	};

	const parseVarName = () => {
		const name = input.next();
		if (name.type !== Identifier) input.croak('Expecting variable name');
		return name.value;
	};

	const parseVarDef = (first) => {
		if (!first && !isPunctuation(',')) return null;
		if (isPunctuation(',')) input.next();

		let name = parseVarName(), def;
		if (isOperator('=')) { input.next(); def = parseExpression(); }
		return { name, def };
	};

	const parseLet = () => {
		skipKeyword('let');
		let def, first = true;
		const defs = [];

		while (def = parseVarDef(first)) {
			if (first) first = false;
			defs.push(def);
		}

		return { type: Let, defs, };
	};

	const parseBoolean = () => ({
		type: Boolean,
		value: input.next().value === 'true',
	});

	const parseLambda = () => {
		return {
			type: Lambda,
			name: input.peek().type === Identifier ? input.next().value : null,
			vars: delimited('(', ')', ',', parseVarName),
			body: parseExpression(),
		};
	};

	const parseIf = () => {
		skipKeyword('if');
		const condition = parseExpression();
		if (!isPunctuation('{')) skipKeyword('then');
		const then = parseExpression();
		const result = {
			type: If,
			condition,
			then,
		};

		if (isKeyword('else')) {
			input.next();
			result.else = parseExpression();
		}

		return result;
	};

	const parseAtom = () => {
		return maybeCall(() => {
			if (isPunctuation('(')) {
				input.next();
				const exp = parseExpression();
				skipPunctuation(')');

				return exp;
			}

			if (isIndent()) return parseIndented(currentIndent, input.peek().value);
			if (isPunctuation('{')) return parseProgram();
			if (isKeyword('let')) return parseLet();
			if (isKeyword('if')) return parseIf();
			if (isKeyword('true') || isKeyword('false')) return parseBoolean();
			if (isKeyword('lambda')|| isKeyword('λ')) {
				input.next();
				return parseLambda();
			}

			const token = input.next();
			if (token.type === Identifier || token.type === Number || token.type === String) return token;
			unexpected();
		});
	};

	const parseCall = (func) => ({
		type: Call, func, args: delimited('(', ')', ',', parseExpression), });

	const parseExpression = () => maybeCall(() => maybeBinary(parseAtom(), 0));

	const parseProgram = () => {
		const program = delimited('{', '}', ';', parseExpression);
		if (program.length === 0) return FALSE;
		if (program.length === 1) return program[0];

		return { type: Program, program };
	};

	const parseIndented = (parentIndent, innerIndent) => {
		const program = indented(parentIndent, innerIndent, parseExpression);
		if (program.length === 0)  return FALSE;
		if (program.length === 1) return program[0];

		return { type: Program, program };
	};

	const parseTop = () => {
			const program = [];
			if (isIndent()) {
				currentIndent = input.peek().value;
				skipIndent('\n');
			}

			while (!input.eof()) {
				program.push(parseExpression());
				if (!input.eof()) {
					currentIndent = input.peek().value;
					skipIndent('\n');
				}
			}
		// let currentIndent = '\n';
		// const program = [], indents = [];
		//
		// console.log("!");
		// while (!input.eof()) {
		// 	console.log("!");
		// 	if (isIndent()) {
		// 		const nextIndent = input.next().value,
		// 			existed = indents.indexOf(nextIndent) >= 0;
		// 		console.log(nextIndent, '<<<');
		// 		if (currentIndent === nextIndent) {
		// 			program.push(parseExpression());
		// 		}
		// 	} else {
		// 		console.log('!!');
		// 		program.push(parseExpression());
		// 	}
		// }

		return { type: Program, program };
	};

	// const parseTopLevel = () => {
	// 	const program = [];
	// 	while (!input.eof()) {
	// 		program.push(parseExpression());
	// 		if (!input.eof()) skipPunctuation(';');
	// 	}
	//
	// 	return { type: Program, program };
	// };

	return parseTop();
}
