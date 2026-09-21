import { describe, it, expect } from 'vitest';

export class TestGroup {
	#groupName;

	constructor(groupName) {
		this.#groupName = groupName;
	}

	checkValue(name, value, expected) {
		if (arguments.length !== 3) {
			throw new Error('testには3つの引数が必要です');
		}

		describe(this.#groupName, () => {
			it(name, () => {
				expect(value).toBe(expected);
			});
		});
	}



	checkFunction(name, func, expected) {
		describe(this.#groupName, () => {
			it(name, async () => {
				expect(await func()).toEqual(expected);
			});
		});
	}
}