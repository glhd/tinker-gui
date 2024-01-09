import {Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels";
import Editor from "./Editor.tsx";
import Terminal from "./Terminal.tsx";
import {useEffect, useState} from "react";
import {startNewSession} from "./useTinker.ts";
import useXterm from "./useXterm.ts";
import {IPty} from "tauri-pty";

export default function App(props: { cwd: string }) {
	const [value, setValue] = useState<string | undefined>(() => {
		const value = localStorage.getItem('value');
		if (value) {
			return value;
		}
	});
	const [width, setWidth] = useState(0);
	const [pty, setPty] = useState<IPty>();
	const [disposeLastPty, setDisposeLastPty] = useState<() => void>(() => {
		return () => {};
	});
	const {terminal, addon} = useXterm();
	
	// Store current value to localstorage periodically
	useEffect(() => {
		if (value) {
			localStorage.setItem('value', value);
		}
	}, [value]);
	
	// Sync terminal and tinker PTY instance
	useEffect(() => {
		if (!terminal || !pty) {
			return;
		}
		
		console.log('Initializing terminal UI…');
		
		pty.resize(terminal.cols, terminal.rows);
		
		const disposables = [
			pty.onData(data => terminal.write(data)),
			terminal.onData(data => pty.write(data)),
			terminal.onResize(({cols, rows}) => pty.resize(cols, rows)),
		];
		
		return () => {
			console.log('Disposing of terminal UI…');
			disposables.forEach(d => d.dispose());
		};
	}, [terminal, pty]);
	
	return (
		<PanelGroup direction="horizontal" className="100vh w-full">
			<Panel defaultSize={50} minSize={20}>
				<Editor
					onRun={async (code) => {
						if (terminal) {
							disposeLastPty();
							const {session, dispose} = await startNewSession(props.cwd, code, terminal);
							setPty(session);
							setDisposeLastPty(dispose);
						}
					}}
					onChange={code => setValue(code)}
					defaultValue={value}
				/>
			</Panel>
			<PanelResizeHandle className="w-2 bg-gray-100" />
			<Panel defaultSize={50} minSize={20} onResize={(size) => setWidth(size)}>
				<Terminal terminal={terminal} addon={addon} paneSize={width} />
			</Panel>
		</PanelGroup>
	);
}
