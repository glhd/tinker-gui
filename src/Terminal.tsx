import { useEffect, useRef } from "react";
import useResize from "./useResize.ts";
import type { ITerminal } from './useTerminal.ts';

export default function Terminal({ terminal, paneSize }: {
	terminal: ITerminal,
	paneSize: number
}) {
	const { width, height } = useResize();
	const ref = useRef(null);
	
	// Connect the terminal to the DOM once we have it set up
	useEffect(() => {
		if (ref.current) {
			terminal.open(ref.current);
		}
	}, [terminal, ref.current]);
	
	// Resize the terminal on window resize
	useEffect(() => terminal.resize(), [width, height, paneSize]);
	
	return (
		<div className="font-mono bg-slate-800" ref={ ref } style={ { height } } />
	);
};
