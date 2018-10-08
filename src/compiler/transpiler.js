import { Number, String, Boolean, Identifier, Binary, Assign, Let, Lambda, If, Program, Call, FALSE } from './symbols';

export function transplile(exp) {
	return js(exp);

	function js(exp, parent) {
		switch (exp.type) {
		case Number:
		case String:
		case Boolean:
			return jsAtom(exp, parent);
		case Identifier:
			return jsIdentifier(exp);
		case Binary:
			return jsBinary(exp, parent);
		case Assign:
			return jsAssign(exp);
		case Let:
			return jsLet(exp);
		case Lambda:
			return jsLambda(exp, parent);
		case If:
			return jsIf(exp, parent);
		case Program:
			return jsProgram(exp, parent);
		case Call:
			return jsCall(exp, parent);
		default:
			throw new Error(`Can not transpile ${JSON.stringify(exp)}`);
		}
	}

	function jsAtom(exp, parent) {
		return wrapReturn(JSON.stringify(exp.value), parent);
	}

	function makeVar(name) {
		return name;
	}

	function jsIdentifier(exp) {
		return makeVar(exp.value);
	}

	function jsBinary(exp, parent) {
		if (exp.operator === '|>') return `(${js(exp.right)}(${js(exp.left)}))`;
		return wrapReturn(`(${js(exp.left)} ${exp.operator} ${js(exp.right)})`, parent);
	}

	function jsAssign(exp) {
		return `let ${js(exp.left)} ${exp.operator} ${js(exp.right)}`;
}

	function jsLet(exp) {
		if (exp.vars.length === 0)
			return js(exp.body);

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

	function jsLambda(exp, parent) {
		let code = 'function ';
		if (exp.name) code += makeVar(exp.name);
		code += `(${exp.vars.map(makeVar).join(',')}) { `;
		code += `${js(exp.body, exp)} }`;
		return wrapReturn(code, parent);
	}

	function jsIf(exp, parent) {
		return wrapReturn(`(${js(exp.condition)}!== false ? ${js(exp.then)} : ${js(exp.else || FALSE)})`, parent);
	}

	function jsProgram(exp, parent) {
		if (parent) {
			return `${exp.program.map((fragment, i) => {
				return i === exp.program.length - 1 ? `return ${js(fragment)}` : js(fragment);
			}).join(';\n')}`;
		} else {
			return `${exp.program.map(js).join(';\n')}`;
		}
	}

	function jsCall(exp, parent) {
		return wrapReturn(`${js(exp.func)}(${exp.args.map(js).join(', ')})`, parent);
	}
}

function wrapReturn(statement, parent) {
	if (parent && parent.type === Lambda) {
		return `return ${statement}`;
	}
	return statement;
}
