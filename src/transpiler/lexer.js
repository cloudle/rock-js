import { MATCHES, TOKENS, count } from '../utils';

export default function(source) {
	return source.split(' ').map(s => s.trim()).filter(s => s.length);
}

export class Lexer {
	tokenize(code, options = {}) {
		this.indent 				= 0;										// current indentation level
		this.baseIndent 		= 0;										// overall minimum indentation level
		this.indebt 				= 0;										// over-indentation at the current level
		this.outdebt				= 0;										// under-outdentation at the current level
		this.indents				= [];										// tack of all current indentation levels
		this.tokens					= [];										// stream of parsed tokens in the form `['TYPE', value, location data]`
		this.currentLine		= options.line || 0;		// position of starting line
		this.currentColumn	= options.column || 0;	// position of starting column

		let i = 0;
		code = this.clean(code);

		while (this.chunk = code.slice(i)) {
			const consumed = this.identifierToken()
				|| this.commentToken()
				|| this.whitespaceToken()
				|| this.lineToken()
				|| this.stringToken()
				|| this.numberToken()
				|| this.literalToken();

			[this.currentLine, this.currentColumn] = this.getLineAndColumn(consumed);
			i += consumed;

			if (i.length > code.length) return;
		}

		console.log(this.tokens);
	}

	identifierToken() {
		const match = MATCHES.IDENTIFIER.exec(this.chunk);
		if (!match) return 0;

		const [input, id, colon] = match,
			currentLength = id.length,
			prev = this.prev(),
			seemLikeProperty = prev && (['.', '?.', '::', '?::'].indexOf(prev[0]) >= 0 || (!prev.spaced && prev[0] === '@')),
			tag = colon || seemLikeProperty ? 'PROPERTY' : 'IDENTIFIER';

		this.registerToken(tag, id, 0, currentLength);
		return id.length;
	}

	commentToken() {

	}

	whitespaceToken() {

	}

	lineToken() {

	}

	stringToken() {
		const quote = MATCHES.STRING_START.exec(this.chunk) || [];

		if (!quote) return 0;
		let regex;

		if (quote === "'") regex = MATCHES.STRING_SINGLE;
		else if (quote === '"') regex = MATCHES.STRING_DOUBLE;
		else if (quote === "'''") regex = MATCHES.HEREDOC_SINGLE;
		else if (quote === '"""') regex = MATCHES.HEREDOC_DOUBLE;

		const isDoc = quote.length === 3;

		if (quote.input) {
			this.registerToken('STRING', quote.input);
			return quote.input.length;
		}
	}

	numberToken() {

	}

	literalToken() {
		let tag;
		const match = MATCHES.OPERATOR.exec(this.chunk),
			value = match ? match[0] : this.chunk.charAt(0);

		tag = value;

		if (TOKENS.MATH.indexOf(value) >= 0) tag = 'MATH';
		else if (TOKENS.COMPARE.indexOf(value) >= 0) tag = 'COMPARE';
		else if (TOKENS.COMPOUND_ASSIGN.indexOf(value) >= 0) tag = 'COMPOUND_ASSIGN';
		else if (TOKENS.UNARY.indexOf(value) >= 0) tag = 'UNARY';
		else if (TOKENS.UNARY_MATH.indexOf(value) >= 0) tag = 'UNARY_MATH';
		else if (TOKENS.SHIFT.indexOf(value) >= 0) tag = 'SHIFT';

		this.registerToken(tag, value);
		return value.length;
	}

	registerToken(tag, value, offset, length, origin) {
		const newToken = this.makeToken(tag, value, offset, length, origin);
		this.tokens.push(newToken);
		return newToken;
	}

	makeToken(tag, value, offset, length = value.length, origin) {
		const lastCharacter = length > 0 ? length - 1 : 0,
			startingLineAndColumn = this.getLineAndColumn(offset),
			endingLineAndColumn = this.getLineAndColumn(offset + lastCharacter),
		 	locationData = {
				firstLine: startingLineAndColumn[0],
				firstColumn: startingLineAndColumn[1],
				lastLine: endingLineAndColumn[0],
				lastColumn: endingLineAndColumn[1],
			},
			token = [tag, value, locationData];

		if (origin) token.origin = origin;

		return token;
	}

	getLineAndColumn(offset) {
		if (offset === 0) return [this.currentLine, this.currentColumn];

		let string = offset >= this.chunk.length
				? this.chunk : this.chunk.slice(0, offset),
			lineCount = count(string, '\n'),
			column = this.currentColumn;

		if (lineCount > 0) {
			const lines = string.split('/n');
			column = lines[lines.length - 1].length;
		} else {
			column += string.length;
		}

		return [this.currentLine + lineCount, column];
	}

	prev() {
		return this.tokens[this.tokens.length - 1];
	}

	value(useOrigin = false) {
		const token = this.tokens[this.tokens.length - 1];
		return useOrigin && token && token.origin ? token.origin[1] : token[1];
	}

	clean(code) {
		if (code.charCodeAt(0) === TOKENS.BOM) code = code.slice(1);
		code = code.replace(/\r/g, '').replace(MATCHES.TRAILING_SPACES);

		if (MATCHES.WHITESPACE.test(code)) {
			code = `\n${code}`;
			this.currentLine--;
		}

		return code;
	}
}
