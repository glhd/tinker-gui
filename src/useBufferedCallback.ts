import { useRef, useState } from "react";
import { IDisposable } from "./disposables.ts";

export type BufferedCallback = (data: string) => void;
export type SetBufferedCallback = (callback: BufferedCallback) => void;

export default function useBufferedCallback(name: string): [BufferedCallback, SetBufferedCallback, IDisposable] {
	const onData = useRef<BufferedCallback>();
	const [buffer, setBuffer] = useState<string[]>([]);
	
	const callback: BufferedCallback = (data: string) => {
		// console.log(`[${ name }] ${ data }`);
		
		if (onData.current) {
			// console.log(`onData: ${data}`);
			onData.current(data);
		} else {
			setBuffer([...buffer, data]);
		}
	};
	
	const setCallback = (callback: BufferedCallback) => {
		console.log(`Setting new "${ name }" buffered callback…`);
		
		if (buffer.length) {
			buffer.forEach(data => callback(data));
			setBuffer([]);
		}
		
		onData.current = callback;
	};
	
	const disposable = {
		dispose() {
			console.log(`Disposing of "${name}" buffered callback…`);
			onData.current = undefined;
		}
	};
	
	return [callback, setCallback, disposable];
}
