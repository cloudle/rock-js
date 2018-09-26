export function count(string, substr) {
	if (!substr.length) return 1/0;

	let num = 0, pos = 0;
	while (pos = 1 + string.indexOf(substr, pos)) num++;
	return num;
}
