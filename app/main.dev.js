import { app, Menu, TouchBar } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { isProd } from './utils/mode.js';
import createWindow from './utils/createWindow.js';
import generateMenu from './utils/generateMenu.js';
import getCwd from './utils/getCwd.js';
import startWorkers from './utils/startWorkers.js';

log.transports.file.level = 'info';

let mainWindow, cwd;
let disposeOfWorkers = noop => noop;

if (isProd) {
	require('source-map-support').install();
}

const activateMainWindow = () => {
	if (!mainWindow) {
		mainWindow = createWindow(cwd);
		
		mainWindow.loadURL(`file://${ __dirname }/app.html`);
		
		mainWindow.setTouchBar(new TouchBar({
			items: [
				new TouchBar.TouchBarSpacer({ size: 'flexible' }),
				new TouchBar.TouchBarButton({
					label: 'Run Tinker Code ►',
					backgroundColor: '#ea4f36',
					click: () => mainWindow.webContents.send('run'),
				}),
				new TouchBar.TouchBarSpacer({ size: 'flexible' }),
			],
		}));
		
		disposeOfWorkers();
		
		mainWindow.once('ready-to-show', () => {
			disposeOfWorkers = startWorkers(cwd, mainWindow.webContents);
		});
	}
};

app.on('activate', activateMainWindow);

app.on('ready', () => {
	cwd = getCwd();
	
	activateMainWindow();
	
	mainWindow.on('closed', () => {
		disposeOfWorkers();
		
		mainWindow = null;
		disposeOfWorkers = noop => noop;
	});
	
	Menu.setApplicationMenu(generateMenu({
		run: () => mainWindow.webContents.send('run'),
		open: () => {
			cwd = getCwd(true);
			mainWindow.setTitle(`Tinker - ${ cwd }`);
		},
	}));
	
	autoUpdater.logger = log;
	autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
