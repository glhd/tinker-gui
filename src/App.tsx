import {Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels";
import {open} from '@tauri-apps/api/dialog';
import {homeDir} from '@tauri-apps/api/path';
import {exit} from '@tauri-apps/api/process';
import Editor from "./Editor.tsx";
import Terminal from "./Terminal.tsx";
import {useEffect, useState} from "react";
import Loading from "./Loading.tsx";

export default function App() {
	const [cwd, setCwd] = useState<string>();
	const [terminal_size, setTerminalSize] = useState(0);
	
	useEffect(() => {
		const timeout = setTimeout(async () => {
			if (cwd) {
				return;
			}
			
			const selection = await open({
				title: 'Select your Laravel application…',
				multiple: false,
				directory: true,
				defaultPath: await homeDir(),
			});

			if (null === selection || Array.isArray(selection)) {
				return await exit(1);
			}

			setCwd(selection);
		}, 10);
		
		return () => clearTimeout(timeout);
	}, []);
	
	if (!cwd) {
		return <Loading />;
	}
	
	return (
		<PanelGroup direction="horizontal" className="100vh w-full">
			<Panel defaultSize={50} minSize={20}>
				<Editor />
			</Panel>
			<PanelResizeHandle className="w-2 bg-gray-100" />
			<Panel defaultSize={50} minSize={20} onResize={(size) => setTerminalSize(size)}>
				<Terminal
					cwd={cwd}	
					paneSize={terminal_size} 
				/>
			</Panel>
		</PanelGroup>
	);
}
