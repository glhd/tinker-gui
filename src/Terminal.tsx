import {Terminal as XTerm} from '@xterm/xterm';
import {FitAddon} from '@xterm/addon-fit';
import {useEffect, useRef} from "react";
import {spawn} from "tauri-pty";
import useResize from "./useResize.ts";
import tailwind from "./tailwind.ts";

export default function Terminal(props: { paneSize: number }) {
	const {paneSize} = props;
	const {width, height} = useResize();
	const dom_ref = useRef(null);
	const terminal = useRef<XTerm | null>(null);
	const addon = useRef<FitAddon | null>(null);
	
	// Set up our PTY and connect it to the xterm UI
	useEffect(() => {
		if (!terminal.current) {
			return;
		}
		
		const pty = spawn('php', ['artisan', 'tinker'], {
			cwd: '/Users/inxilpro/Development/web/www',
			cols: terminal.current.cols,
			rows: terminal.current.rows,
		});
		
		pty.onData(data => terminal.current?.write(data));
		pty.onExit(() => terminal.current?.clear());
		
		terminal.current.onData(data => pty.write(data));
		terminal.current.onResize(({cols, rows}) => pty.resize(cols, rows));
		
		return () => pty.kill();
	}, [terminal.current]);
	
	// Set up our xterm UI
	useEffect(() => {
		terminal.current = new XTerm();
		
		addon.current = new FitAddon();
		terminal.current.loadAddon(addon.current);
		
		terminal.current.options.theme = {
			background: tailwind.colors.slate[800],
			foreground: tailwind.colors.slate[100],
		};
	}, []);
	
	// Connect xterm to the DOM
	useEffect(() => {
		if (terminal.current && dom_ref.current) {
			terminal.current.open(dom_ref.current);
		}
	}, [terminal.current, dom_ref.current]);
	
	// Resize the terminal on Window resize
	useEffect(() => {
		addon.current?.fit();
	}, [width, height, paneSize]);
	
	return (
		<div className="font-mono bg-slate-800 p-2" ref={dom_ref} style={{height}} />
	);
};
