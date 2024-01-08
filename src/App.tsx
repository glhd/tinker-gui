import {Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels";
import Editor from "./Editor.tsx";
import Terminal from "./Terminal.tsx";
import {useEffect, useState} from "react";
import useTinker from "./useTinker.ts";

export default function App(props: { cwd: string }) {
	const [value, setValue] = useState<string|undefined>(() => {
		const value = localStorage.getItem('value');
		if (value) {
			return value;
		}
	});
	const [width, setWidth] = useState(0);
	const {tinker, run} = useTinker(props.cwd);
	
	// Store current value to localstorage periodically
	useEffect(() => {
		if (value) {
			console.log(`Writing to localstorage: ${value}`);
			localStorage.setItem('value', value);
		}
	}, [value]);
	
	return (
		<PanelGroup direction="horizontal" className="100vh w-full">
			<Panel defaultSize={50} minSize={20}>
				<Editor
					onRun={(code) => run(code)}
					onChange={code => setValue(code)}
					defaultValue={value}
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
