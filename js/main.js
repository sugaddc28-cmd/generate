// js/main.js
import { DropZone } from './dropZone.js';

new DropZone(
	(handle) => console.log('ファイルのhandle:', handle),

	async (handle) => {
		for await (const child of handle.values()) {
			console.log(child.kind, child.name);
		}
	}
);