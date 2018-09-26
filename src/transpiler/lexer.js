import { count } from '../utils';

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
	}

	identifierToken() {

	}

	commentToken() {

	}

	whitespaceToken() {

	}

	lineToken() {

	}

	stringToken() {

	}

	numberToken() {

	}

	literalToken() {

	}

	token(tag, value, offset, length, origin) {
		const newToken = this.makeToken(tag, value, offset, length, origin);
		this.tokens.push(newToken);
		return newToken;
	}

	makeToken(tag, value, offset, length = value.length, origin) {
		const lastCharacter = length > 0 ? length - 1 : 0,
			startingLineAndColumn = getLineAndColumn(offset),
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
}
