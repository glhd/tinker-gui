import Monaco, {useMonaco} from '@monaco-editor/react';
import {useEffect, useRef} from "react";
import {editor} from "monaco-editor";
import ITextModel = editor.ITextModel;

export default function Editor(props: {
	onRun: (code: string) => any,
	onChange: (code: string) => any,
	defaultValue?: string,
}) {
	const { onRun, onChange, defaultValue = `<?php\n\n` } = props;
	const monaco = useMonaco();
	const debounce = useRef<number>();
	
	useEffect(() => {
		if (!monaco) {
			return;
		}
		
		const modelCallback = (model: ITextModel) => {
			model.onDidChangeContent(() => {
				clearTimeout(debounce.current);
				debounce.current = setTimeout(() => {
					onChange(model.getValue());
				}, 500);
			});
		};
		
		const disposables = [
			monaco.editor.addEditorAction({
				id: 'run-tinker',
				label: 'Run in Tinker',
				keybindings: [
					monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
					monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR,
				],
				contextMenuGroupId: 'navigation',
				contextMenuOrder: 1,
				run(editor: editor.ICodeEditor): void {
					const value = editor.getModel()?.getValue();
					if (value) {
						onRun(value);
					}
				}
			}),
			monaco.editor.onDidCreateModel(modelCallback),
		];
		
		const models = monaco.editor.getModels();
		if (models.length) {
			modelCallback(models[0]);
		}
		
		return () => disposables.forEach(d => d.dispose());
	}, [monaco]);
	return (
		<Monaco
			height="100vh"
			defaultLanguage="php"
			theme="vs-dark"
			defaultValue={defaultValue}
		/>
	);
}
