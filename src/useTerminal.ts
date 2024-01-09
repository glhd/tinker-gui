import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import tailwind from "./tailwind.ts";
import { IDisposable } from "./disposables.ts";
import useBufferedCallback from "./useBufferedCallback.ts";

export interface ITerminal {
	cols: number,
	rows: number,
	open: (parent: HTMLElement) => void,
	resize: () => void,
	write: (data: string) => void,
	onData: (callback: (data: string) => any) => void,
	onResize: (callback: (size: { cols: number, rows: number }) => any) => void,
}

export default function useTerminal(): ITerminal {
	const [onData, setOnData, disposableData] = useBufferedCallback('terminal');
	
	const [buffer, setBuffer] = useState<string[]>([]);
	
	const onResize = useRef<((size: { cols: number, rows: number }) => any)>(() => () => null);
	const terminal = useRef<XTerm>();
	const addon = useRef<FitAddon>();
	
	// Always make sure there's an xterm instance loaded
	useEffect(() => {
		if (terminal.current) {
			return;
		}
		
		console.log(`Creating new xterm instance…`);
		
		const xterm = new XTerm();
		const fit = new FitAddon();
		
		terminal.current = xterm;
		addon.current = fit;
		
		terminal.current.loadAddon(addon.current);
		
		terminal.current.options.theme = {
			background: tailwind.colors.slate[800],
			foreground: tailwind.colors.slate[100],
		};
		
		if (buffer.length) {
			buffer.forEach(data => xterm.write(data));
			setBuffer([]);
		}
		
		const disposables: IDisposable[] = [
			xterm,
			fit,
			disposableData,
			xterm.onData(onData),
			xterm.onResize((size) => {
				onResize.current?.call(null, size);
			}),
		];
		
		return () => {
			console.log(`Disposing of xterm instance…`);
			disposables.forEach(d => d.dispose());
			terminal.current = undefined;
			addon.current = undefined;
		};
	}, []);
	
	return {
		cols: terminal.current?.cols || 0,
		rows: terminal.current?.rows || 0,
		open(parent) {
			terminal.current?.open(parent);
		},
		resize() {
			addon.current?.fit();
		},
		write(data) {
			if (terminal.current) {
				terminal.current.write(data);
			} else {
				setBuffer([...buffer, data]);
			}
		},
		onData(callback) {
			setOnData(callback);
		},
		onResize(callback) {
			onResize.current = callback;
		}
	};
}
