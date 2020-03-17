import './patch-vscode.js';
import { hot } from 'react-hot-loader/root';
import React, { useState, useEffect } from 'react';
import SplitPane from 'react-split-pane';
import Editor from './Editor.js';
import Terminal from './Terminal.js';
import useResize from './useResize';

const { ipcRenderer } = window.require('electron');
const settings = window.require('electron-settings');

function Root() {
	const { width } = useResize();
	const [update, setUpdate] = useState(null);
	const [size, setSize] = useState(() => {
		return settings.has('split-pane-size')
			? settings.get('split-pane-size')
			: Math.ceil(width / 2);
	});
	
	useEffect(() => {
		ipcRenderer.on('update', (event, data) => {
			setUpdate(data);
		});
	}, []);
	
	const onChange = (size) => {
		setSize(size);
		settings.set('split-pane-size', size);
	};
	
	return (
		<React.Fragment>
			{ update && (
				<div className="bg-salmon-500 text-white text-center text-sm font-bold p-1 border-b border-gray-800">
					Version { update.version } is available. Restart Tinker to apply the update.
				</div>
			) }
			<SplitPane split="vertical" primary="first" defaultSize={ size } onChange={ onChange }>
				<Editor paneSize={ size } />
				<Terminal paneSize={ width - size } />
			</SplitPane>
		</React.Fragment>
	);
}

export default hot(Root);
