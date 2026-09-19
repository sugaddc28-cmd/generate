import { describe, it, expect } from 'vitest';

export class TestGroup {
	#groupName;

	constructor(groupName) {
		this.#groupName = groupName;
	}

	check(name, value, expected) {

		if (arguments.length !== 3) {
			throw new Error('testには3つの引数が必要です');
		}
		describe(this.#groupName, () => {
			it(name, () => {
				expect(value).toBe(expected);
			});
		});
	}
}