import { TestGroup } from '../helper/testHelper.js';
import { HandleTreeBuilder } from '../../js/handleTreeBuilder.js';

const test = new TestGroup();

// --- テスト用ヘルパー関数 ---
function makeFile(name) {
	return { kind: 'file', name };
}

function makeDir(name, children = []) {
	return {
		kind: 'directory',
		name,
		async *values() {
			yield* children;
		}
	};
}

// 走査されたら失敗するディレクトリを生成するヘルパー
function makeErrorDir(name, errorMessage) {
	return {
		kind: 'directory',
		name,
		async *values() {
			throw new Error(errorMessage);
		}
	};
}


// --- 1. 基本的なファイル取得のテスト ---
const fileHandle = makeFile('test.txt');
const dirHandle = makeDir('root', [fileHandle]);

const builder = new HandleTreeBuilder();
test.checkFunction(
	'ファイルを取得できる',
	() => builder.build(dirHandle),
	{
		type: 'directory',
		name: 'root',
		children: [
			{
				type: 'file',
				name: 'test.txt',
				handle: fileHandle
			}
		]
	}
);


// --- 2. ignoreRules (prefix, exact) のテスト ---
const jsHandle = makeFile('a.js');
const hiddenHandle = makeFile('.gitignore');
const nodeModulesHandle = makeErrorDir('node_modules', 'node_modulesの中を走査してはいけない');

const dirWithIgnored = makeDir('root', [hiddenHandle, nodeModulesHandle, jsHandle]);

const builderWithRules = new HandleTreeBuilder([
	{ type: 'prefix', value: '.' },
	{ type: 'exact', value: 'node_modules' }
]);

test.checkFunction(
	'ignoreRulesに一致するものは除外される',
	() => builderWithRules.build(dirWithIgnored),
	{
		type: 'directory',
		name: 'root',
		children: [
			{
				type: 'file',
				name: 'a.js',
				handle: jsHandle
			}
		]
	}
);


// --- 3. suffixのテスト ---
const logFile = makeFile('debug.log');
const jsFile = makeFile('app.js');
const logJsFile = makeFile('x.log.js');

const suffixBuilder = new HandleTreeBuilder([
	{ type: 'suffix', value: '.log' }
]);

test.checkFunction(
	'suffixに一致するものは除外される',
	() => suffixBuilder.build(makeDir('root', [logFile, jsFile, logJsFile])),
	{
		type: 'directory',
		name: 'root',
		children: [
			{ type: 'file', name: 'app.js', handle: jsFile },
			{ type: 'file', name: 'x.log.js', handle: logJsFile }
		]
	}
);


// --- 4. 並び順のテスト ---
const bJs = makeFile('b.js');
const aTxt = makeFile('a.txt');
const gitignore = makeFile('.gitignore');
const aJs = makeFile('a.js');
const readme = makeFile('README');

const sortBuilder = new HandleTreeBuilder();

test.checkFunction(
	'フォルダ→隠しファイル→拡張子→名前の順に並ぶ',
	() => sortBuilder.build(
		makeDir('root', [bJs, aTxt, makeDir('src'), gitignore, aJs, readme, makeDir('docs')])
	),
	{
		type: 'directory',
		name: 'root',
		children: [
			{ type: 'directory', name: 'docs', children: [] },
			{ type: 'directory', name: 'src', children: [] },
			{ type: 'file', name: '.gitignore', handle: gitignore },
			{ type: 'file', name: 'README', handle: readme },
			{ type: 'file', name: 'a.js', handle: aJs },
			{ type: 'file', name: 'b.js', handle: bJs },
			{ type: 'file', name: 'a.txt', handle: aTxt }
		]
	}
);

// --- 5. build()にファイルハンドルを直接渡した場合 ---
const soloFile = makeFile('solo.txt');

test.checkFunction(
	'build()にファイルハンドルを渡すと、そのファイル1件だけを持つ擬似ディレクトリツリーを返す',
	() => builder.build(soloFile),
	{
		type: 'directory',
		name: 'solo.txt',
		children: [
			{
				type: 'file',
				name: 'solo.txt',
				handle: soloFile
			}
		]
	}
);