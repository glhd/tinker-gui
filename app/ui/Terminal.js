import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import useResize from './useResize.js';
import 'xterm/css/xterm.css';

const { ipcRenderer } = window.require('electron');

export default function Terminal({ paneSize }) {
	const { width, height } = useResize();
	const ref = useRef(null);
	const xterm = useRef({ terminal: null, addon: null });
	
	useEffect(() => {
		let { terminal, addon } = xterm.current;
		
		if (!terminal) {
			terminal = xterm.current.terminal = new XTerm();
			
			addon = xterm.current.addon = new FitAddon();
			terminal.loadAddon(addon);
			
			terminal.setOption('cursorStyle', null);
			terminal.setOption('theme', {
				background: '#1e1e1e',
				foreground: '#d4d4d4',
			});
			
			terminal.open(ref.current);
			
			terminal.onData(data => {
				ipcRenderer.send('stdin', data);
			});
			
			terminal.onResize(size => {
				ipcRenderer.send('terminal-size', size);
			});
			
			// ipcRenderer.on('php-code', () => terminal.clear());
			
			ipcRenderer.on('stdout', (event, data) => {
				terminal.write(data.toString());
			});
		}
		
		addon.fit();
	}, [width, height, paneSize]);
	
	return (
		<div className="p-2 font-mono" ref={ ref } style={ { height } } />
	);
};
