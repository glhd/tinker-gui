export interface IDisposable {
	dispose(): void;
}

export const NoopDisposable: IDisposable = {
	dispose() {
		// noop
	},
};
