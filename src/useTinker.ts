import {useEffect, useRef} from 'react';
import {IPty, spawn} from "tauri-pty";
import {Terminal} from "@xterm/xterm";

export default function useTinker(
	terminal: Terminal|undefined,
	cwd: string = '/Users/inxilpro/Development/web/www'
) {
	const tinker = useRef<IPty>();
	
	useEffect(() => {
		if (!terminal) {
			return;
		}
		
		const pty = spawn('php', ['artisan', 'tinker'], {
			cwd,
			cols: terminal.cols,
			rows: terminal.rows,
		});
		
		const disposables = [
			pty.onData(data => terminal?.write(data)),
			pty.onExit(() => terminal?.clear()),
			terminal.onData(data => pty.write(data)),
			terminal.onResize(({cols, rows}) => pty.resize(cols, rows)),
		];
		
		tinker.current = pty;
		
		return () => {
			disposables.forEach(d => d.dispose());
			pty.kill();
			tinker.current = undefined;
		};
	}, [terminal, cwd]);
	
	return tinker.current;
}
