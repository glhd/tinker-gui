export interface IDisposable {
	dispose(): void;
}

export const NoopDisposable: IDisposable = {
	dispose() {
		// noop
	},
};

export function callbackToDisposable(callback: () => void): IDisposable {
	return {
		dispose() {
			callback();
		}
	};
}
