export default function(source) {
	return source.split(' ').map(s => s.trim()).filter(s => s.length);
}

export class Lexer {
	tokenize(code, options = {}) {
		this.indent 				= 0;									// 
		this.baseIndent 		= 0;									//
	}
}
