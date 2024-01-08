import {Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels";
import Editor from "./Editor.tsx";
import Terminal from "./Terminal.tsx";
import {useState} from "react";

export default function App() {
	const [terminal_size, setTerminalSize] = useState(0);
	
	return (
		<PanelGroup direction="horizontal" className="100vh w-full">
			<Panel defaultSize={50} minSize={20}>
				<Editor />
			</Panel>
			<PanelResizeHandle className="w-2 bg-gray-100" />
			<Panel defaultSize={50} minSize={20} onResize={(size) => setTerminalSize(size)}>
				<Terminal paneSize={terminal_size} />
			</Panel>
		</PanelGroup>
	);
}
