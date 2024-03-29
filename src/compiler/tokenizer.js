import { Identifier, Keyword, keywords, operatorAliases, identifierAlias, Number, Operator, Punctuation, Indent, String } from './symbols';

export function TokenStream(input) {
	let current;
	const isKeyword = word => keywords.indexOf(word) >= 0,
		isDigit = char => /[0-9]/i.test(char),
		isIdStart = char => /[a-zλ_]/i.test(char),
		isId = char => isIdStart(char) || '?!-<>=0123456789'.indexOf(char) >= 0,
		isOperatorChar = char => '+-*/%=&|<>!.'.indexOf(char) >= 0,
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

		if (isKeyword(id)) {
			return { type: Keyword, value: id };
		} else if (operatorAliases[id]) {
			return { type: Operator, value: operatorAliases[id] };
		} else if (identifierAlias[id]) {
			return { type: Identifier, value: identifierAlias[id] };
		}

		return { type: Identifier, value: id };
	};

	const readPunctuation = () => ({
		type: Punctuation,
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
		const spaced = readWhile(isWhiteSpace);

		if (spaced.charAt(0) === '\n') return {
			type: Indent,
			value: spaced,
		};

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

export default TokenStream;
