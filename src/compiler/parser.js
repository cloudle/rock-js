import { Call, FALSE, Identifier, If, Keyword, Number, Operator, PRECEDENCE, Program, Puntuation, String } from './symbols';

export default function parse(input) {
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

	const isPunctuation = (char) => {
		const token = input.peek();
		return token && token.type === Puntuation && (!char || token.value === char) && token;
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

	const skipOperator = (op) => {
		if (isOperator(op)) input.next();
		else input.croak(`Expecting operator: "${op}"`);
	};

	const skipDeclaration = (keyword) => {
		if (isKeyword('let')) input.next();
		else input.croak(`Expecting declaration: ${keyword}`);
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
					type: operator.value === '=' ? 'assign' : 'binary',
					operator: operator.value,
					left,
					right: maybeBinary(parseAtom(), hisPrecedence),
				}, myPrecedence)
			}
		}

		return left;
	};

	const parseDeclaration = () => {
		skipDeclaration();
		const token = input.next();
		if (token.type !== Identifier) input.croak('Expecting variable name');
		skipOperator('=');

		return {
			type: 'declaration',
			left: token,
			right: maybeBinary(parseAtom(), 0),
		};
	};

	const parseProgram = () => {
		const program = delimited('{', '}', ';', parseExpression);
		if (program.length === 0) return FALSE;
		if (program.length === 1) return program[0];

		return { type: Program, program };
	};

	const parseAtom = () => {
		return maybeCall(() => {
			if (isPunctuation('(')) {
				input.next();
				const exp = parseExpression();
				skipPunctuation(')');

				return exp;
			}

			if (isPunctuation('{')) return parseProgram();
			if (isKeyword('let')) return parseDeclaration();
			const token = input.next();
			if (token.type === Identifier || token.type === Number || token.type === String) return token;
		});
	};

	const parseCall = (func) => ({
		type: Call, func, args: delimited('(', ')', ',', parseExpression), });

	const parseExpression = () => maybeCall(() => maybeBinary(parseAtom(), 0));

	return parseAtom();
}


// export default function parse(input) {
// 	const isPunctuation = (char) => {
// 		const token = input.peek();
// 		return token && token.type === Puntuation && (!char || token.value === char) && token;
// 	};
//
// 	const isKeyword = (keyword) => {
// 		const token = input.peek();
// 		return token && token.type === Keyword && (!keyword || token.value === keyword) && token;
// 	};
//
// 	const isOperator = (op) => {
// 		const token = input.peek();
// 		return token && token.type === Operator && (!op || token.value === op) && token;
// 	};
//
// 	const skipPunctuation = (char) => {
// 		if (isPunctuation(char)) input.next();
// 		else input.croak(`Expecting punctuation: "${char}"`)
// 	};
//
// 	const skipKeyword = (keyword) => {
// 		if (isKeyword(keyword)) input.next();
// 		else input.croak(`Expecting keyword: "${keyword}"`);
// 	};
//
// 	const skipOperator = (op) => {
// 		if (isOperator(op)) input.next();
// 		else input.croak(`Expecting operator: "${op}"`);
// 	};
//
// 	const unexpected = () => {
// 		input.croak(`Unexpected token: ${JSON.stringify(input.peek())}`);
// 	};
//
// 	const maybeBinary = (left, myPrecedence) => {
// 		const token = isOperator();
// 		if (token) {
// 			const hisPrecedence = PRECEDENCE[token.value];
// 			if (hisPrecedence > myPrecedence) {
// 				input.next();
// 				return maybeBinary({
// 					type: token.value === '=' ? 'assign' : 'binary',
// 					operator: token.value,
// 					left,
// 					right: maybeBinary(parseAtom(), hisPrecedence),
// 				}, myPrecedence)
// 			}
// 		}
//
// 		return left;
// 	};
//
// 	const delimited = (start, stop, separator, parser) => {
// 		let result = [], first = true;
// 		skipPunctuation(start);
//
// 		while (!input.eof()) {
// 			if (isPunctuation(stop)) break;
// 			if (first) first = false; else skipPunctuation(separator);
// 			if (isPunctuation(stop)) break;
// 			result.push(parser());
// 		}
//
// 		skipPunctuation(stop);
// 		return result;
// 	};
//
// 	const parseCall = (func) => {
// 		return {
// 			type: Call,
// 			func,
// 			args: delimited('(', ')', ',', parseExpression),
// 		}
// 	};
//
// 	const parseVarName = () => {
// 		const name = input.next();
// 		if (name.type !== Identifier) input.croak('Expecting variable name');
// 		return name.value;
// 	};
//
// 	const parseIf = () => {
// 		skipKeyword('if');
// 		const condition = parseExpression();
// 		if (!isPunctuation('{')) skipKeyword('then');
// 		const then = parseExpression();
// 		const result = {
// 			type: If,
// 			condition,
// 			then,
// 		};
//
// 		if (isKeyword('else')) {
// 			input.next();
// 			result.else = parseExpression();
// 		}
//
// 		return result;
// 	};
//
// 	const parseBool = () => ({
// 		type: Boolean,
// 		value: input.next().value === 'true',
// 	});
//
// 	const maybeCall = (expr) => {
// 		expr = expr();
// 		return isPunctuation('(') ? parseCall(expr) : expr;
// 	};
//
// 	const parseAtom = () => {
// 		return maybeCall(() => {
// 			if (isPunctuation('(')) {
// 				input.next();
// 				const exp = parseExpression();
// 				skipPunctuation(')');
// 				return exp;
// 			}
// 			if (isPunctuation('{')) return parseProgram();
// 			if (isKeyword('if')) return parseIf();
// 			if (isKeyword('true') || isKeyword('false')) return parseBool();
// 			const token = input.next();
// 			if (token.type === Identifier || token.type === Number || token.type === String) return token;
//
// 			unexpected();
// 		})
// 	};
//
// 	const parseTopLevel = () => {
// 		const program = [];
// 		while (!input.eof()) {
// 			program.push(parseExpression());
// 			if (!input.eof()) skipPunctuation(';');
// 		}
//
// 		return { type: Program, program };
// 	};
//
// 	const parseProgram = () => {
// 		const program = delimited('{', '}', ';', parseExpression);
// 		if (program.length === 0) return FALSE;
// 		if (program.length === 1) return program[0];
//
// 		return { type: Program, program };
// 	};
//
// 	const parseExpression = () => maybeCall(() => maybeBinary(parseAtom(), 0));
//
// 	return parseTopLevel();
// }