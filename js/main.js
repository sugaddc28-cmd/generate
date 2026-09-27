// js/main.js
import { DropZone } from './dropZone.js';
import { HandleTreeBuilder } from './handleTreeBuilder.js';
import { MarkdownBuilder } from './markdownBuilder.js';

const output = document.getElementById('output');
const ignoreHidden = document.getElementById('ignoreHidden');
const ignoreNodeModules = document.getElementById('ignoreNodeModules');
const markdownBuilder = new MarkdownBuilder();

let lastHandle = null;

function buildIgnoreRules() {
	const rules = [];
	if (ignoreHidden.checked) rules.push({ type: 'prefix', value: '.' });
	if (ignoreNodeModules.checked) rules.push({ type: 'exact', value: 'node_modules' });
	return rules;
}

async function render(handle) {
	lastHandle = handle;
	const treeBuilder = new HandleTreeBuilder(buildIgnoreRules());
	const tree = await treeBuilder.build(handle);
	output.value = await markdownBuilder.build(tree);
}

function reRender() {
	if (lastHandle) render(lastHandle);
}

new DropZone(render);

ignoreHidden.addEventListener('change', reRender);
ignoreNodeModules.addEventListener('change', reRender);
window.addEventListener('focus', reRender);
document.addEventListener('visibilitychange', () => {
	if (document.visibilityState === 'visible') reRender();
});
setInterval(reRender, 60_000);