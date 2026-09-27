// HandleTreeBuilderが返すtreeを受け取り、Markdown文字列を組み立てる
export class MarkdownBuilder {
	async build(tree) {
		const { treeString, fileList } = this.#flatten(tree);

		let output = '# ディレクトリ構造\n\n';
		output += treeString + '\n\n';
		output += '---\n\n# ファイル詳細情報\n\n';

		for (const item of fileList) {
			const section = await this.#renderFile(item);
			if (section) output += section;
		}

		return output;
	}

	// treeを再帰的に辿り、ツリー表示用の文字列とファイル一覧を同時に作る
	#flatten(tree, depth = 0, currentPath = '', fileList = [], treeLines = []) {
		const indent = '  '.repeat(depth);

		for (const child of tree.children) {
			const path = currentPath ? `${currentPath}/${child.name}` : child.name;
			
			if (child.type === 'directory') {
				treeLines.push(`${indent}- ${child.name}/`);
				this.#flatten(child, depth + 1, path, fileList, treeLines);
			} else {
				treeLines.push(`${indent}- ${child.name}`);
				fileList.push({ handle: child.handle, path });
			}
		}

		return { fileList, treeString: treeLines.join('\n') };
	}

	async #renderFile(item) {
		try {
			const file = await item.handle.getFile();
			const text = await file.text();
			const ext = item.path.includes('.') ? item.path.split('.').pop() : '';

			return `## File: ${item.path}\n\n\`\`\`${ext}\n${text}\n\`\`\`\n\n`;
		} catch (e) {
			console.error(`読み込みエラー: ${item.path}`, e);
			return null;
		}
	}
}