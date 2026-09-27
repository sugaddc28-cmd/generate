// ドラッグ&ドロップを受け取り、handleを渡すイベント
export class DropZone {
	#onDrop;

	constructor(onDrop) {
		this.#onDrop = onDrop;

		// ドラッグ中の既定の動作を止める
		window.addEventListener('dragover', (e) => e.preventDefault());
		window.addEventListener('drop', (e) => e.preventDefault());

		// ドロップ時の処理
		window.addEventListener('drop', (e) => this.handleDrop(e));
	}

	async handleDrop(event) {
		const items = Array.from(event.dataTransfer.items);

		for (const item of items) {
			if (item.kind !== 'file') continue; //URL等を除外
			const handle = await item.getAsFileSystemHandle();
			if (!handle) continue;

			this.#onDrop(handle);
			break;
		}
	}
}