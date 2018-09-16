import { Operator, Number } from './symbols';

export default function(ast) {
	const operatorMap = { sum: '+', mul: '*', sub: '-', div: '/' };
	const transpileNode = node => node.type === Number ? transpileNumber(node) : transpileOperator(node);
	const transpileNumber = node => node.value;
	const transpileOperator = node => {
		const code = node.expr.map(transpileNode).join(` ${operatorMap[ast.value]} `);

		return `(${code})`;
	};

	return transpileNode(ast);
}
