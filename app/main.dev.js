import { app, Menu, TouchBar, dialog, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
// import IPCStream from 'electron-ipc-stream';
import { isProd, isDebug } from './utils/mode.js';
import createWindow from './utils/createWindow.js';
import generateMenu from './utils/generateMenu.js';
import getCwd from './utils/getCwd.js';
import runTinker from './workers/tinker.js';
import runLanguageServer from './workers/language-server.js';

log.transports.file.level = 'info';
autoUpdater.logger = log;
autoUpdater.allowPrerelease = true;

let mainWindow, tinker, cwd, manuallyUpdating = false;

if (isProd) {
	require('source-map-support').install();
}

if (isDebug) {
	autoUpdater.on('error', (error) => {
		dialog.showErrorBox('Auto-Update Error: ', null === error ? "unknown" : (error.stack || error).toString());
	})
}

autoUpdater.on('update-available', (info) => {
	if (manuallyUpdating) {
		dialog.showMessageBox({
			'title': 'Update is Available',
			'message': `Version ${info.version} is available and is downloading in the background. You will be notified when it's ready.`,
		});
		manuallyUpdating = false;
	}
});

autoUpdater.on('update-not-available', (info) => {
	if (manuallyUpdating) {
		dialog.showMessageBox({
			'title': 'You are up-to-date!',
			'message': `You are currently running the latest version of Tinker!`,
		});
		manuallyUpdating = false;
	}
})

autoUpdater.on('error', (err) => {
	if (manuallyUpdating) {
		dialog.showErrorBox('Update Error', 'There was an error updating. Please try again later.');
		manuallyUpdating = false;
	}
});

autoUpdater.on('update-downloaded', (update) => {
	if (mainWindow) {
		mainWindow.webContents.send('update', update);
	}
	
	manuallyUpdating = false;
});

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
		
		mainWindow.once('ready-to-show', () => {
			// FIXME: Use an ipcRenderer signal to say when the PTY is ready
			tinker = runTinker(cwd, mainWindow.webContents);
			runLanguageServer(cwd, mainWindow.webContents);
		});
	}
};

ipcMain.on('php-code', (event, data) => {
	activateMainWindow();
	
	mainWindow.webContents.send('clear-terminal');
	
	if (tinker) {
		tinker.dispose();
	}
	
	tinker = runTinker(cwd, mainWindow.webContents, data);
});

app.on('activate', activateMainWindow);

app.on('ready', () => {
	cwd = getCwd();
	
	activateMainWindow();
	
	mainWindow.on('closed', () => {
		if (tinker) {
			tinker.dispose();
			tinker = null;
		}
		
		mainWindow = null;
	});
	
	Menu.setApplicationMenu(generateMenu({
		run: () => mainWindow.webContents.send('run'),
		open: () => {
			if (mainWindow) {
				mainWindow.close();
			}
			
			cwd = getCwd(true);
			activateMainWindow();
			mainWindow.setTitle(`Tinker - ${ cwd }`);
		},
		checkForUpdates: () => {
			manuallyUpdating = true;
			autoUpdater.checkForUpdatesAndNotify();
		},
	}));
});

app.once('ready', () => autoUpdater.checkForUpdatesAndNotify());

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
