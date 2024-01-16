import Monaco, { useMonaco } from '@monaco-editor/react';
import { useEffect, useRef } from "react";
import { editor } from "monaco-editor";
import { registerLanguage } from "./registerLanguage.ts";
import useTauriEventListener from "./useTauriEventListener.ts";
import ITextModel = editor.ITextModel;

export default function Editor(props: {
	onRun: (code: string) => any,
	onChange: (code: string) => any,
	defaultValue?: string,
}) {
	const { onRun, onChange, defaultValue = `<?php\n\n` } = props;
	const monaco = useMonaco();
	const debounce = useRef<number>();
	const active_model = useRef<ITextModel>();
	
	useTauriEventListener('run', () => {
		if (active_model.current) {
			onRun(active_model.current.getValue());
		}
	}, [active_model.current, onRun]);
	
	useEffect(() => {
		if (! monaco) {
			return;
		}
		
		const modelCallback = (model: ITextModel) => {
			active_model.current = model;
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
				label: 'Run Code',
				keybindings: [
					monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter
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
		
		registerLanguage(monaco.languages)
			.forEach(d => disposables.push(d));
		
		const models = monaco.editor.getModels();
		if (models.length) {
			modelCallback(models[0]);
		}
		
		return () => disposables.forEach(d => d.dispose());
	}, [monaco, onRun]);
	
	return (
		<Monaco
			height="100vh"
			defaultLanguage="php-snippet"
			theme="vs-dark"
			defaultValue={ defaultValue }
		/>
	);
}
