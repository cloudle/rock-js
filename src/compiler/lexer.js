export default function(input) {
	let pos = 0, line = 0, column = 0;

	const peek = () => input.charAt(pos);

	const eof = () => peek() === '';

	const next = () => {
		const char = input.charAt(pos++);
		if (char === '\n') {
			line++; column = 0;
		} else column++;
	};

	const croak = (message) => {
		throw new Error(`${message} [line: ${line}, column: ${column}]`)
	};

	return { next, peek, eof, croak };
}
