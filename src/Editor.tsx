import Monaco, {useMonaco} from '@monaco-editor/react';
import {useEffect} from "react";
import {editor} from "monaco-editor";

export default function Editor(props: { onRun: (code: string) => Promise<any>}) {
	const { onRun } = props;
	const monaco = useMonaco();
	useEffect(() => {
		if (! monaco) {
			return;
		}
		
		monaco.editor.addEditorAction({
			id: 'run-tinker',
			label: 'Run in Tinker',
			keybindings: [
				monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
			],
			contextMenuGroupId: 'navigation',
			contextMenuOrder: 1,
			run(editor: editor.ICodeEditor): void {
				const value = editor.getModel()?.getValue();
				if (value) {
					onRun(value);
				}
			}
		});
	}, [monaco]);
	
	return (
		<Monaco 
			height="100vh"
			defaultLanguage="php"
			theme="vs-dark"
			defaultValue={`<?php\n\n// Tinker away!\n\n`} 
		/>
	);
}
