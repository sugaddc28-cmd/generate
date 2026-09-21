// test/helper/debug.js
export async function log(value) {
	const resolved = await value;
	console.dir(resolved, { depth: null, colors: true });
}