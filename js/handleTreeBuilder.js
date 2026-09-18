

export class HandleTreeBuilder {
	// ディレクトリのハンドルを渡し、再帰的に取得
	async build(dirHandle) {
		const items = [];

		for await (const child of dirHandle.values()) {
			if (child.kind === 'directory') {
				// directoryの中をさらに列挙
				const children = await this.build(child);
				items.push({
					type: 'directory',
					name: child.name,
					children: children
				});
			} else if (child.kind === 'file') {
				items.push({
					type: 'file',
					name: child.name,
					handle: child
				});
			}
		}

		return items;
	}
}