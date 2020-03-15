import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/edcore.main';
import useResize from './useResize';
import registerLanguageClient from './language-client.js';

import 'monaco-editor/esm/vs/editor/editor.worker';
import 'monaco-editor/esm/vs/basic-languages/php/php.contribution';

const { ipcRenderer } = window.require('electron');
const settings = window.require('electron-settings');

monaco.languages.register({
	id: 'php',
	extensions: [
		'.php',
		'.php4',
		'.php5',
		'.php7',
	],
	aliases: [
		'PHP'
	],
	mimetypes: [
		'text/php',
		'text/x-php',
		'application/php',
		'application/x-php',
		'application/x-httpd-php',
		'application/x-httpd-php-source',
	],
});

export default function Editor({ paneSize }) {
	const debounce = useRef(null);
	const element = useRef(null);
	const editor = useRef(null);
	const { width, height } = useResize();
	
	const run = () => {
		if (null === editor.current) {
			return;
		}
		
		ipcRenderer.send('php-code', editor.current.getModel().getValue());
	};
	
	useEffect(() => {
		if (null === editor.current) {
			editor.current = monaco.editor.create(element.current, {
				language: 'php',
				value: settings.has('code')
					? settings.get('code')
					: '<?php\n\n',
				theme: 'vs-dark',
				glyphMargin: true,
				lightbulb: {
					enabled: true
				}
			});
			
			editor.current.addAction({
				id: 'run-tinker',
				label: 'Run in Tinker',
				keybindings: [
					monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
				],
				contextMenuGroupId: 'navigation',
				contextMenuOrder: 1,
				run,
			});
			
			editor.current.getModel().onDidChangeContent(e => {
				clearTimeout(debounce.current);
				debounce.current = setTimeout(() => {
					const code = editor.current.getModel().getValue();
					settings.set('code', code);
				}, 500);
			});
			
			console.warn('Registering lang client.');
			registerLanguageClient(editor.current).then(disposable => {
				console.warn('Lang client', disposable);
			});
		}
		
		editor.current.layout();
		
		return () => {
			// TODO: This fires on every resize…
			// editor.current.dispose();
			// editor.current = null;
		}
	}, [paneSize, width, height]);
	
	useEffect(() => {
		ipcRenderer.on('run', run);
	}, []);
	
	return (
		<div style={{ height }} ref={ element } />
	);
};
