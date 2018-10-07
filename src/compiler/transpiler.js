import { Number, String, Boolean, Identifier, Binary, Assign, Let, Lambda, If, Program, Call, FALSE } from './symbols';

export function transplile(exp) {
	return js(exp);

	function js(exp) {
		switch (exp.type) {
		case Number:
		case String:
		case Boolean:
			return jsAtom(exp);
		case Identifier:
			return jsIdentifier(exp);
		case Binary:
			return jsBinary(exp);
		case Assign:
			return jsAssign(exp);
		case Let:
			return jsLet(exp);
		case Lambda:
			return jsLambda(exp);
		case If:
			return jsIf(exp);
		case Program:
			return jsProgram(exp);
		case Call:
			return jsCall(exp);
		default:
			throw new Error(`Can not transpile ${JSON.stringify(exp)}`);
		}
	}

	function jsAtom(exp) {
		return JSON.stringify(exp.value);
	}

	function makeVar(name) {
		return name;
	}

	function jsIdentifier(exp) {
		return makeVar(exp.value);
	}

	function jsBinary(exp) {
		return `(${js(exp.left)}${exp.operator}${js(exp.right)})`;
	}

	function jsAssign(exp) {
		return jsBinary(exp);
	}

	function jsLet(exp) {
		if (exp.vars.length === 0) return js(exp.body);
		const iife = {
			type: Call,
			func: {
				type: Lambda,
				vars: [exp.vars[0].name],
				body: {
					type: Let,
					vars: exp.vars.slice(1),
					body: exp.body,
				},
			},
			args: [exp.vars[0].def || FALSE],
		};

		return `(${js(iife)})`;
	}

	function jsLambda(exp) {
		let code = '(function )';
		if (exp.name) code += makeVar(exp.name);
		code += `(${exp.vars.map(makeVar).join(',')}) {`;
		code += `return ${js(exp.body)} })`;
		return code;
	}

	function jsIf(exp) {
		return `(${js(exp.condition)}!== false 
		? 
		:)`;
	}

	function jsProgram(exp) {

	}

	function jsCall(exp) {

	}
}
