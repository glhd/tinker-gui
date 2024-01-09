import { useRef, useState } from "react";
import { IDisposable } from "./disposables.ts";

export type BufferedCallback = (data: string) => void;
export type SetBufferedCallback = (callback: BufferedCallback) => void;

export default function useBufferedCallback(name: string): [BufferedCallback, SetBufferedCallback, IDisposable] {
	const onData = useRef<BufferedCallback>();
	const [buffer, setBuffer] = useState<string[]>([]);
	
	const callback: BufferedCallback = (data: string) => {
		console.log(`[${ name }] ${ data }`);
		
		if (onData.current) {
			onData.current(data);
		} else {
			setBuffer([...buffer, data]);
		}
	};
	
	const setCallback = (callback: BufferedCallback) => {
		if (buffer.length) {
			buffer.forEach(data => callback(data));
			setBuffer([]);
		}
		
		onData.current = callback;
	};
	
	const disposable = {
		dispose() {
			onData.current = undefined;
		}
	};
	
	return [callback, setCallback, disposable];
}
