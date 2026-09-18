
// ドラッグ&ドロップを受け取り、handleを渡すイベント
export class DropZone{
	#onFile;
	#onDirectory;

	constructor(onFile, onDirectory){
		this.#onFile = onFile;
		this.#onDirectory = onDirectory;


		// ドラッグ中の既定の動作を止める
		window.addEventListener('dragover', (e) => e.preventDefault());
		window.addEventListener('drop', (e) => e.preventDefault());

		// ドロップ時の処理
		window.addEventListener('drop', (e) => this.handleDrop(e));
	}

	async handleDrop(event){
		const items = Array.from(event.dataTransfer.items);

		for (const item of items) {
			if (item.kind !== 'file') continue; //URL等を除外
			const handle = await item.getAsFileSystemHandle();
			if (!handle) continue;

			if (handle.kind === 'directory') {
				this.#onDirectory(handle);
			} else if (handle.kind === 'file') {
				this.#onFile(handle);
			}
			break;
		}
	}
}