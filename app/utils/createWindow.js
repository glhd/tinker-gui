const { BrowserWindow } = require('electron');
const { isDebug } = require('./mode.js');

module.exports = function createWindow(cwd = null) {
	const window = new BrowserWindow({
		backgroundColor: '#f7f7f7',
		height: 860,
		width: 1200,
		minWidth: 800,
		show: false,
		title: cwd
			? `Tinker - ${ cwd }`
			: 'Tinker',
		titleBarStyle: 'default',
		webPreferences: {
			nodeIntegration: true,
			devTools: isDebug,
		}
	});
	
	if (isDebug) {
		const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');
		
		installExtension(REACT_DEVELOPER_TOOLS)
			.catch(err => {
				console.log('An error occurred: ', err);
			});
	}
	
	window.once('ready-to-show', () => {
		window.show();
		window.focus();
	});
	
	return window;
};
