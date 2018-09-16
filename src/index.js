import compile from './transpiler';

const sourceCode = 'mul 3 sub 2 sum 1 3 4';

module.exports = () => {
	console.log(compile(sourceCode));
};
