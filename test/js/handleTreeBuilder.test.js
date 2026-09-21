import { TestGroup } from '../helper/testHelper.js';
import { HandleTreeBuilder } from '../../js/handleTreeBuilder.js';

const test = new TestGroup();

// テスト用データ
const fileHandle = {
	kind:'file',
	name:'test.txt'
};

const dirHandle = {
	kind:'directory',
	name:'root',

	async *values(){
		yield fileHandle;
	}
}

// テスト実行
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


// テスト用データ

const jsHandle = {
	kind: 'file',
	name: 'a.js'
};

const hiddenHandle = {
	kind: 'file',
	name: '.gitignore'
};

// 走査されたら失敗するようにしておく(打ち切られている確認)
const nodeModulesHandle = {
	kind: 'directory',
	name: 'node_modules',
	async *values() {
		throw new Error('node_modulesの中を走査してはいけない');
	}
};

const dirWithIgnored = {
	kind: 'directory',
	name: 'root',
	async *values() {
		yield hiddenHandle;
		yield nodeModulesHandle;
		yield jsHandle;
	}
};

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

// --- suffixのテスト ---
const logFile = makeFile('debug.log');
const jsFile = makeFile('app.js');
const logJsFile = makeFile('x.log.js'); // ".log"で終わっていないので残るはず

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

// --- 並び順のテスト ---
// わざとバラバラの順で渡す
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