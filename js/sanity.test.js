import { TestGroup } from "../test/testHelper";
const test = new TestGroup("環境確認");

test.check(
	'1+1は2',
	1+1,
	3
);