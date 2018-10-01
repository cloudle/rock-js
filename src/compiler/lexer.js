import {
	Program, String, Number, Keyword, Call, If, Identifier, Puntuation, Operator,
	keywords, TRUE, FALSE, PRECEDENCE,
} from './symbols';

export function InputStream(input) {
	let pos = 0, line = 0, column = 0;

	const peek = () => input.charAt(pos);

	const eof = () => peek() === '';

	const next = () => {
		const char = input.charAt(pos++);
		if (char === '\n') {
			line++; column = 0;
		} else column++;

		return char;
	};

	const croak = (message) => {
		throw new Error(`${message} [line: ${line}, column: ${column}]`)
	};

	return { next, peek, eof, croak };
}

export function TokenStream(input) {
	let current;
	const isKeyword = word => keywords.indexOf(word) >= 0,
		isDigit = char => /[0-9]/i.test(char),
		isIdStart = char => /[a-z_]/i.test(char),
		isId = char => isIdStart(char) || '?!-<>=0123456789'.indexOf(char) >= 0,
		isOperatorChar = char => '+-*/%=&|<>!'.indexOf(char) >= 0,
		isPunctuation = char => ',;(){}[]'.indexOf(char) >= 0,
		isWhiteSpace = char => ' \t\n'.indexOf(char) >= 0;

	const readWhile = (predicate) => {
		let string = '';
		while (!input.eof() && predicate(input.peek())) {
			string += input.next();
		}
		return string;
	};

	const readNumber = () => {
		let hasDot = false;
		const number = readWhile((char) => {
			if (char === '.') {
				if (hasDot) return false;
				hasDot = true;
				return true;
			}
			return isDigit(char);
		});

		return { type: Number, value: parseFloat(number) }
	};

	const readIdentifier = () => {
		const id = readWhile(isId);

		return { type: isKeyword(id) ? Keyword :Identifier, value: id };
	};

	const readPunctuation = () => ({
		type: Puntuation,
		value: input.next(),
	});

	const readOperator = () => ({
		type: Operator,
		value: readWhile(isOperatorChar),
	});

	const readEscaped = (end) => {
		let escaped = false, string = '';
		input.next();

		while (!input.eof()) {
			let char = input.next();
			if (escaped) {
				string += char;
				escaped = false;
			} else if (char === '\\') {
				escaped = true;
			} else if (char === end) {
				break;
			} else {
				string += char;
			}
		}

		return string;
	};

	const readString = () => {
		return { type: String, value: readEscaped('"') };
	};

	const skipComment = () => {
		readWhile((char) => char !== '\n');
		input.next();
	};

	const readNext = () => {
		readWhile(isWhiteSpace);
		if (input.eof()) return null;

		let char = input.peek();
		if (char === '#') {
			skipComment();
			return readNext();
		}
		if (char === '"') return readString();
		if (isDigit(char)) return readNumber();
		if (isIdStart(char)) return readIdentifier();
		if (isPunctuation(char)) return readPunctuation();
		if (isOperatorChar(char)) return readOperator();

		input.croak(`Can't handle character: ${char}`);
	};

	const peek = () => current || (current = readNext());

	const next = () => {
		let token = current; current = null;
		return token || readNext();
	};

	const eof = () => peek() === null;

	return { next, peek, eof, croak: input.croak };
}

export function parse(input) {
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
		else input.croak(`Expecting punctuation: "${char}"`)
	};

	const skipKeyword = (keyword) => {
		if (isKeyword(keyword)) input.next();
		else input.croak(`Expecting keyword: "${keyword}"`);
	};

	const skipOperator = (op) => {
		if (isOperator(op)) input.next();
		else input.croak(`Expecting operator: "${op}"`);
	};

	const unexpected = () => {
		input.croak(`Unexpected token: ${JSON.stringify(input.peek())}`);
	};

	const maybeBinary = (left, myPrecedence) => {
		const token = isOperator();
		if (token) {
			const hisPrecedence = PRECEDENCE[token.value];
			if (hisPrecedence > myPrecedence) {
				input.next();
				return maybeBinary({
					type: token.value === '=' ? 'assign' : 'binary',
					operator: token.value,
					left,
					right: maybeBinary(parseAtom(), hisPrecedence),
				}, myPrecedence)
			}
		}

		return left;
	};

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

	const parseCall = (func) => {
		return {
			type: Call,
			func,
			args: delimited('(', ')', ',', parseExpression),
		}
	};

	const parseVarName = () => {
		const name = input.next();
		if (name.type !== Identifier) input.croak('Expecting variable name');
		return name.value;
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

	const parseBool = () => ({
		type: Boolean,
		value: input.next().value === 'true',
	});

	const maybeCall = (expr) => {
		expr = expr();
		return isPunctuation('(') ? parseCall(expr) : expr;
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
			if (isKeyword('if')) return parseIf();
			if (isKeyword('true') || isKeyword('false')) return parseBool();
			const token = input.next();
			if (token.type === Identifier || token.type === Number || token.type === String) return token;

			unexpected();
		})
	};

	const parseTopLevel = () => {
		const program = [];
		while (!input.eof()) {
			program.push(parseExpression());
			if (!input.eof()) skipPunctuation(';');
		}

		return { type: Program, program };
	};

	const parseProgram = () => {
		const program = delimited('{', '}', ';', parseExpession);
		if (program.length === 0) return FALSE;
		if (program.length === 1) return program[0];

		return { type: Program, program };
	};

	const parseExpression = () => maybeCall(() => maybeBinary(parseAtom(), 0));

	return parseTopLevel();
}
