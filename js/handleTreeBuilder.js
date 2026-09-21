export class HandleTreeBuilder {
	#ignoreRules;

	constructor(ignoreRules = []) {
		this.#ignoreRules = ignoreRules;
	}

	async build(dirHandle) {
		const items = [];

		for await (const child of dirHandle.values()) {
			if (this.#matchesIgnoreRules(child.name)) continue;

			if (child.kind === 'directory') {
				items.push(await this.build(child));
			} else if (child.kind === 'file') {
				items.push({
					type: 'file',
					name: child.name,
					handle: child
				});
			}
		}

		this.#sort(items);

		return {
			type: 'directory',
			name: dirHandle.name,
			children: items
		};
	}

	#matchesIgnoreRules(name) {
		return this.#ignoreRules.some((rule) => {
			if (rule.type === 'exact') return name === rule.value;
			if (rule.type === 'prefix') return name.startsWith(rule.value);
			if (rule.type === 'suffix') return name.endsWith(rule.value);
			return false;
		});
	}

	// フォルダ→隠しファイル→拡張子→名前の順にソート
	#sort(items) {
		items.sort((a, b) => {
			// フォルダ＞ファイルの順に並べる
			if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;

			// 隠しファイル（例: .gitignore）を前方に並べる
			const isHiddenA = a.name.startsWith('.');
			const isHiddenB = b.name.startsWith('.');
			if (isHiddenA !== isHiddenB) return isHiddenA ? -1 : 1;

			// 拡張子順
			if (a.type === 'file') {
				const extentionA = this.#getExtention(a.name);
				const extentionB = this.#getExtention(b.name);
				if (extentionA !== extentionB)
					return extentionA.localeCompare(extentionB, undefined, { numeric: true });
			}

			// 名前の順
			return a.name.localeCompare(b.name, undefined, { numeric: true });
		});

	}

	// ファイル拡張子の取得
	#getExtention(name) {
		// 隠しファイルの場合最初のドットを消す
		if (name.startsWith('.'))
			name = name.slice(1);

		// 残りの文字列にドットが含まれていれば、最後のドット以降は拡張子とする
		if (!name.includes('.')) return '';
		return name.slice(name.indexOf('.') + 1);
	}
}