import { Operator, Number, } from './symbols';

export default function parse(tokens) {
	let i = 0;

	const peek = () => tokens[i];
	const consume = () => tokens[i++];

	const parseNumber = () => {
		const value = parseInt(consume());

		return { value, type: Number };
	};

	const parseOperator = () => {
		const node = { value: consume(), type: Operator, expr: [] };

		while (peek()) node.expr.push(parseExpr());
		return node;
	};

	const parseExpr = () => /\d/.test(peek()) ? parseNumber() : parseOperator();

	return parseExpr();
}
