const { app, shell, Menu } = require('electron');
const { isDebug } = require('./mode.js');

module.exports = function generateMenu({ run, open }) {
	const template = [
		{
			label: 'File',
			submenu: [
				{
					accelerator: 'CmdOrCtrl+O',
					label: 'Open Directory…',
					click() {
						open();
					}
				},
				{
					accelerator: 'CmdOrCtrl+R',
					label: 'Run Code',
					click() {
						run();
					}
				}
			]
		},
		{
			label: 'Edit',
			submenu: [
				{ role: 'undo' },
				{ role: 'redo' },
				{ type: 'separator' },
				{ role: 'cut' },
				{ role: 'copy' },
				{ role: 'paste' },
				{ role: 'delete' },
				{ role: 'selectall' }
			]
		},
		{
			label: 'View',
			submenu: [
				{ role: 'resetzoom' },
				{ role: 'zoomin' },
				{ role: 'zoomout' },
				{ type: 'separator' },
				{ role: 'togglefullscreen' },
			],
		},
		{
			role: 'window',
			submenu: [
				{ role: 'minimize' },
				{ role: 'close' }
			]
		},
		{
			role: 'help',
			submenu: [
				{
					label: 'View on GitHub…',
					click: () => shell.openExternal('https://github.com/glhd/tinker-gui'),
				}
			]
		}
	];
	
	if (isDebug) {
		template[2].submenu.unshift({ role: 'forcereload' });
		template[2].submenu.unshift({ role: 'toggledevtools' });
		template[2].submenu.unshift({ role: 'separator' });
	}
	
	if ('darwin' === process.platform) {
		template.unshift({
			label: app.getName(),
			submenu: [
				{
					label: 'About Tinker',
					role: 'about'
				},
				{ type: 'separator' },
				{ role: 'services' },
				{ type: 'separator' },
				{ role: 'hide' },
				{ role: 'hideothers' },
				{ role: 'unhide' },
				{ type: 'separator' },
				{ role: 'quit' }
			]
		});
		
		// Window menu
		template[4].submenu = [
			{ role: 'close' },
			{ role: 'minimize' },
			{ role: 'zoom' },
			{ type: 'separator' },
			{ role: 'front' }
		];
	}
	
	return Menu.buildFromTemplate(template);
};
