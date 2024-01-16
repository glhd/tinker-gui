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
		terminal.onData(data => pty.write(data));
		terminal.onResize(({ cols, rows }) => pty.resize(cols, rows));
		
		pty.resize(terminal.cols, terminal.rows);
	}, []);
	
	// if ('loading' === terminal.state || 'loading' === pty.state) {
	// 	return <Loading />;
	// }
	
	return (
		<PanelGroup direction="horizontal" autoSaveId="tinker-panels" className="100vh w-full bg-bg">
			<Panel defaultSize={ 50 } minSize={ 20 }>
				<Editor
					onRun={ (code) => {
						pty.run(code);
					} }
					onChange={ code => setValue(code) }
					defaultValue={ value }
				/>
			</Panel>
			<PanelResizeHandle className="w-4 flex items-center justify-center bg-bg text-fg">
				<svg className="fill-white w-4 h-6" viewBox="0 0 24 24">
					<path fill="currentColor" d="M18,16V13H15V22H13V2H15V11H18V8L22,12L18,16M2,12L6,16V13H9V22H11V2H9V11H6V8L2,12Z"></path>
				</svg>
			</PanelResizeHandle>
			<Panel defaultSize={ 50 } minSize={ 20 } onResize={ (size) => setWidth(size) }>
				<Terminal terminal={ terminal } paneSize={ width } />
			</Panel>
		</PanelGroup>
	);
}
