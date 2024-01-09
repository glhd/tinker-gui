import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Editor from "./Editor.tsx";
import Terminal from "./Terminal.tsx";
import { useEffect, useState } from "react";
import useTerminal from "./useTerminal.ts";
import useEditorValue from "./useEditorValue.ts";
import usePty from "./usePty.ts";

export default function Tinker({ cwd }: { cwd: string }) {
	const [value, setValue] = useEditorValue();
	const terminal = useTerminal();
	const pty = usePty(cwd);
	const [width, setWidth] = useState(0);
	
	useEffect(() => {
		console.log(`Setting up terminal/pty listeners…`);
		
		pty.onData(data => terminal.write(data));
		
		const disposables = [
			terminal.onData(data => pty.write(data)),
			terminal.onResize(({ cols, rows }) => pty.resize(cols, rows)),
		];
		
		pty.resize(terminal.cols, terminal.rows);
		
		return () => {
			console.log('Disposing of terminal/pty listeners…');
			disposables.forEach(d => d.dispose());
		};
	}, [terminal, pty]);
	
	return (
		<PanelGroup direction="horizontal" className="100vh w-full">
			<Panel defaultSize={ 50 } minSize={ 20 }>
				<Editor
					onRun={ (code) => {
						console.log(`RUN: ${ code }`); // FIXME
					} }
					onChange={ code => setValue(code) }
					defaultValue={ value }
				/>
			</Panel>
			<PanelResizeHandle className="w-2 bg-gray-100" />
			<Panel defaultSize={ 50 } minSize={ 20 } onResize={ (size) => setWidth(size) }>
				<Terminal terminal={ terminal } paneSize={ width } />
			</Panel>
		</PanelGroup>
	);
}
