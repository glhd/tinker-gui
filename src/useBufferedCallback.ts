import { useRef, useState } from "react";

export type BufferedCallback = (data: string) => void;

export default function useBufferedCallback(name: string): [BufferedCallback, (callback: BufferedCallback) => any] {
	const onData = useRef<((data: string) => any)>(() => () => null);
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
		onData.current = callback;
	};
	
	return [callback, setCallback];
}
