import {useEffect, useRef} from "react";
import useResize from "./useResize.ts";
import {FitAddon} from "@xterm/addon-fit";
import {Terminal as XTerm} from "@xterm/xterm";

export default function Terminal(props: {
	terminal: XTerm|undefined,
	addon: FitAddon|undefined,
	paneSize: number
}) {
	const {terminal, addon, paneSize} = props;
	const {width, height} = useResize();
	const ref = useRef(null);
	
	// Connect the terminal to the DOM once we have it set up
	useEffect(() => {
		if (ref.current) {
			terminal?.open(ref.current);
		}
	}, [terminal, ref.current]);
	
	// Resize the terminal on window resize
	useEffect(() => addon?.fit(), [width, height, paneSize]);
	
	return (
		<div className="font-mono bg-slate-800 p-2" ref={ref} style={{height}} />
	);
};
