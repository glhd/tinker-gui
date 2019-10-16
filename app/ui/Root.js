import { hot } from 'react-hot-loader/root';
import React, { useState } from 'react';
import SplitPane from 'react-split-pane';
import Editor from './Editor.js';
import Terminal from './Terminal.js';
import useResize from './useResize';

const settings = window.require('electron-settings');

function Root() {
	const { width } = useResize();
	const [size, setSize] = useState(() => {
		return settings.has('split-pane-size')
			? settings.get('split-pane-size')
			: Math.ceil(width / 2);
	});
	
	const onChange = (size) => {
		setSize(size);
		settings.set('split-pane-size', size);
	};
	
	return (
		<SplitPane split="vertical" primary="first" defaultSize={ size } onChange={ onChange }>
			<Editor paneSize={ size } />
			<Terminal paneSize={ width - size } />
		</SplitPane>
	);
}

export default hot(Root);
