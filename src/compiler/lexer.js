import { String, Number, Keyword, Identifier, Puntuation, Operator, keywords } from './symbols';

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
