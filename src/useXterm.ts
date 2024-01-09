import {useEffect, useRef} from 'react';
import {Terminal as XTerm} from "@xterm/xterm";
import {FitAddon} from "@xterm/addon-fit";
import tailwind from "./tailwind.ts";

export default function useXterm() {
	const terminal = useRef<XTerm>();
	const addon = useRef<FitAddon>();
	
	useEffect(() => {
		terminal.current = new XTerm();
		
		addon.current = new FitAddon();
		terminal.current.loadAddon(addon.current);
		
		terminal.current.options.theme = {
			background: tailwind.colors.slate[800],
			foreground: tailwind.colors.slate[100],
		};
		
		return () => {
			terminal.current?.dispose();
			addon.current?.dispose();
		};
	}, []);
	
	return {
		terminal: terminal.current,
		addon: addon.current,
	};
}
