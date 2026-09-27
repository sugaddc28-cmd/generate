// js/main.js
import { DropZone } from './dropZone.js';
import { HandleTreeBuilder } from './handleTreeBuilder.js';
import { MarkdownBuilder } from './markdownBuilder.js';
import { HandleStore } from './handleStore.js';

const output = document.getElementById('output');
const ignoreHidden = document.getElementById('ignoreHidden');
const ignoreNodeModules = document.getElementById('ignoreNodeModules');
const openButton = document.getElementById('openButton');
const markdownBuilder = new MarkdownBuilder();
const handleStore = new HandleStore();

let lastHandle = null;

function buildIgnoreRules() {
	const rules = [];
	if (ignoreHidden.checked) rules.push({ type: 'prefix', value: '.' });
	if (ignoreNodeModules.checked) rules.push({ type: 'exact', value: 'node_modules' });
	return rules;
}

async function render(handle) {
	lastHandle = handle;
	openButton.style.display = 'none';
	handleStore.save(handle);
	const treeBuilder = new HandleTreeBuilder(buildIgnoreRules());
	const tree = await treeBuilder.build(handle);
	output.value = await markdownBuilder.build(tree);
}

function reRender() {
	if (lastHandle) render(lastHandle);
}

new DropZone(render);

openButton.addEventListener('click', async () => {
	const previous = await handleStore.load();
	const handle = await window.showDirectoryPicker(
		previous ? { startIn: previous } : {}
	);
	render(handle);
});

ignoreHidden.addEventListener('change', reRender);
ignoreNodeModules.addEventListener('change', reRender);
window.addEventListener('focus', reRender);
document.addEventListener('visibilitychange', () => {
	if (document.visibilityState === 'visible') reRender();
});
setInterval(reRender, 60_000);