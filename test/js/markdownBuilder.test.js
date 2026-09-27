import { TestGroup } from '../helper/testHelper.js';
import { MarkdownBuilder } from '../../js/markdownBuilder.js';

const test = new TestGroup();

// --- テスト用ヘルパー ---
function makeFileHandle(name, content) {
	return {
		async getFile() {
			return {
				name,
				async text() {
					return content;
				}
			};
		}
	};
}

function makeFileNode(name, content) {
	return {
		type: 'file',
		name,
		handle: makeFileHandle(name, content)
	};
}

function makeDirNode(name, children = []) {
	return {
		type: 'directory',
		name,
		children
	};
}

const builder = new MarkdownBuilder();

// --- 1. 単一ファイルのMarkdown化 ---
test.checkFunction(
	'単一ファイルをMarkdown化できる',
	() => builder.build(
		makeDirNode('root', [makeFileNode('a.js', 'console.log(1);')])
	),
	'# ディレクトリ構造\n\n'
	+ '- a.js\n\n'
	+ '---\n\n# ファイル詳細情報\n\n'
	+ '## File: a.js\n\n```js\nconsole.log(1);\n```\n\n'
);

// --- 2. ネストしたディレクトリのツリー表示 ---
test.checkFunction(
	'ネストしたディレクトリはインデントされたツリーになる',
	() => builder.build(
		makeDirNode('root', [
			makeDirNode('src', [makeFileNode('index.js', 'const x = 1;')])
		])
	),
	'# ディレクトリ構造\n\n'
	+ '- src/\n'
	+ '  - index.js\n\n'
	+ '---\n\n# ファイル詳細情報\n\n'
	+ '## File: src/index.js\n\n```js\nconst x = 1;\n```\n\n'
);

// --- 3. 拡張子なしファイルのコードブロック言語指定 ---
test.checkFunction(
	'拡張子がないファイルはコードブロック言語なしで出力される',
	() => builder.build(
		makeDirNode('root', [makeFileNode('README', 'これはreadmeです')])
	),
	'# ディレクトリ構造\n\n'
	+ '- README\n\n'
	+ '---\n\n# ファイル詳細情報\n\n'
	+ '## File: README\n\n```\nこれはreadmeです\n```\n\n'
);

// --- 4. 読み込みエラー時の扱い ---
test.checkFunction(
	'読み込みエラーが起きたファイルはファイル詳細情報から除外される（ツリー表示には残る）',
	() => {
		const errorHandle = {
			async getFile() {
				throw new Error('読み込み失敗');
			}
		};
		return builder.build(
			makeDirNode('root', [
				{ type: 'file', name: 'broken.js', handle: errorHandle },
				makeFileNode('ok.js', 'ok')
			])
		);
	},
	'# ディレクトリ構造\n\n'
	+ '- broken.js\n'
	+ '- ok.js\n\n'
	+ '---\n\n# ファイル詳細情報\n\n'
	+ '## File: ok.js\n\n```js\nok\n```\n\n'
);