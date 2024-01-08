import {Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels";
import Editor from "./Editor.tsx";
import Terminal from "./Terminal.tsx";
import {useState} from "react";
import useTinker from "./useTinker.ts";

export default function App(props: { cwd: string }) {
	const [width, setWidth] = useState(0);
	const {tinker, run} = useTinker(props.cwd);
	
	return (
		<PanelGroup direction="horizontal" className="100vh w-full">
			<Panel defaultSize={50} minSize={20}>
				<Editor
					onRun={(code) => run(code)}
				/>
			</Panel>
			<PanelResizeHandle className="w-2 bg-gray-100" />
			<Panel defaultSize={50} minSize={20} onResize={(size) => setWidth(size)}>
				<Terminal
					tinker={tinker}
					paneSize={width}
				/>
			</Panel>
		</PanelGroup>
	);
}
