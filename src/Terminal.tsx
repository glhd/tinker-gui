import {Terminal as XTerm} from '@xterm/xterm';
import {FitAddon} from '@xterm/addon-fit';
import {useEffect, useRef} from "react";
import {spawn} from "tauri-pty";
import useResize from "./useResize.ts";
import tailwind from "./tailwind.ts";
import useTinker from "./useTinker.ts";
import useXterm from "./useXterm.ts";

export default function Terminal(props: { paneSize: number }) {
	const {paneSize} = props;
	const {width, height} = useResize();
	const ref = useRef(null);
	const {terminal, addon} = useXterm(ref);
	
	useTinker(terminal);
	
	// Resize the terminal on Window resize
	useEffect(() => addon?.fit(), [width, height, paneSize]);
	
	return (
		<div className="font-mono bg-slate-800 p-2" ref={ref} style={{height}} />
	);
};
