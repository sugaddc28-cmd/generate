// FileSystemHandleをIndexedDBに保存・読み出しするための最小限のラッパー

const DB_NAME = 'code-export-tool';
const STORE_NAME = 'handles';
const KEY = 'lastOpened';

export class HandleStore {
	#dbPromise;

	constructor() {
		this.#dbPromise = this.#openDB();
	}

	#openDB() {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(DB_NAME, 1);
			
			request.onupgradeneeded = () => {
				request.result.createObjectStore(STORE_NAME);
			};
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	async save(handle) {
		const db = await this.#dbPromise;
		return new Promise((resolve, reject) => {
			const tx = db.transaction(STORE_NAME, 'readwrite');
			tx.objectStore(STORE_NAME).put(handle, KEY);
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	}

	async load() {
		const db = await this.#dbPromise;
		return new Promise((resolve, reject) => {
			const tx = db.transaction(STORE_NAME, 'readonly');
			const request = tx.objectStore(STORE_NAME).get(KEY);
			request.onsuccess = () => resolve(request.result ?? null);
			request.onerror = () => reject(request.error);
		});
	}
}