import { Number, String, Boolean, Identifier, Assign, Binary, Program, Lambda, If, Call, } from './symbols';

export function evaluate(exp, env) {
	switch (exp.type) {
	case Number:
	case Boolean:
	case String:
		return exp.value;
	case Identifier:
		return env.get(exp.value);
	case Assign:
		if (exp.left.type !== Identifier)
			throw new Error(`Cannot assign to ${JSON.stringify(exp.left)}`);
		return env.set(exp.left.value, evaluate(exp.right, env));
	case Binary:
		return evaluateOperator(exp, env);
	case Lambda:
		return makeLambda(exp, env);
	case If:
		return evaluateIf(exp, env);
	case Program:
		return evaluateProgram(exp, env);
	case Call:
		return evaluateCall(exp, env);
	default:
		throw new Error(`I don't know how to evaluate ${exp.type}`);
	}
}

function evaluateOperator(exp, env) {
	const op = exp.operator,
		a = evaluate(exp.left, env),
		b = evaluate(exp.right, env);

	function num(x) {
		if (typeof x !== 'number')
			throw new Error(`Expected number but got ${x}`);
		return x;
	}

	function div(x) {
		if (num(x) === 0)
			throw new Error('Divide by zero');
		return x;
	}

	switch (op) {
	case '+': return num(a) + num(b);
	case '-': return num(a) - num(b);
	case '*': return num(a) * num(b);
	case '/': return num(a) / div(b);
	case '%': return num(a) % div(b);
	case '&&':
	case 'and': return a !== false && b;
	case '||':
	case 'or': return a !== false ? a : b;
	case '<': return num(a) < num(b);
	case '>': return num(a) > num(b);
	case '<=': return num(a) <= num(b);
	case '>=': return num(a) >= num(b);
	case '==': return a === b;
	case '!=': return a !== b;
	}

	throw new Error(`Can't apply operator ${op}`);
}

function makeLambda(exp, env) {
	return function lambda() {
		let names = exp.vars, scope = env.extend();
		for (let i = 0; i < names.length; i += 1)
			scope.def(names[i], i < arguments.length ? arguments[i] : false);
		return evaluate(exp.body, scope);
	}
}

function evaluateIf(exp, env) {
	let cond = evaluate(exp.condition, env);
	if (cond !== false) return evaluate(exp.then, env);
	return exp.else ? evaluate(exp.else, env) : false;
}

function evaluateProgram(exp, env) {
	let val = false;
	exp.program.forEach((innerExp) => {
		val = evaluate(innerExp, env);
	});

	return val;
}

function evaluateCall(exp, env) {
	let func = evaluate(exp.func, env);
	return func.apply(null, exp.args.map((arg) => evaluate(arg, env)));
}
