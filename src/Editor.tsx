import Monaco, {useMonaco} from '@monaco-editor/react';
import {useEffect} from "react";
import {editor} from "monaco-editor";

export default function Editor() {
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
			run(editor: editor.ICodeEditor, ...args): void | Promise<void> {
				// FIXME: console.log(editor.getModel()?.getValue());
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
