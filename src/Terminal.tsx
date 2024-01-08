import {useEffect, useRef} from "react";
import useResize from "./useResize.ts";
import useTinker from "./useTinker.ts";
import useXterm from "./useXterm.ts";

export default function Terminal(props: { cwd: string|undefined, paneSize: number }) {
	const {paneSize, cwd} = props;
	const {width, height} = useResize();
	const ref = useRef(null);
	const {terminal, addon} = useXterm(ref);
	
	useTinker(terminal, cwd);
	
	// Resize the terminal on Window resize
	useEffect(() => addon?.fit(), [width, height, paneSize]);
	
	return (
		<div className="font-mono bg-slate-800 p-2" ref={ref} style={{height}} />
	);
};
