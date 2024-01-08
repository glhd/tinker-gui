import {useEffect, useRef} from "react";
import useResize from "./useResize.ts";
import useTinker from "./useTinker.ts";
import useXterm from "./useXterm.ts";

export default function Terminal(props: { cwd: string | undefined, paneSize: number }) {
	const {paneSize, cwd} = props;
	const {width, height} = useResize();
	const ref = useRef(null);
	const {terminal, addon} = useXterm(ref);
	const {tinker} = useTinker(cwd);
	
	// Sync terminal and tinker PTY instance
	useEffect(() => {
		if (!terminal || !tinker) {
			return;
		}
		
		tinker.resize(terminal.cols, terminal.rows);
		
		const disposables = [
			tinker.onData(data => terminal.write(data)),
			terminal.onData(data => tinker.write(data)),
			terminal.onResize(({cols, rows}) => tinker.resize(cols, rows)),
		];
		
		return () => {
			disposables.forEach(d => d.dispose());
		};
	}, [terminal, tinker]);
	
	// Resize the terminal on window resize
	useEffect(() => addon?.fit(), [width, height, paneSize]);
	
	return (
		<div className="font-mono bg-slate-800 p-2" ref={ref} style={{height}} />
	);
};
