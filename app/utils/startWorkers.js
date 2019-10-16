import { ipcMain } from 'electron';
import startTinker from '../workers/tinker.js';
import log from 'electron-log';

let tinkerWorker;
let run = noop => noop;

ipcMain.on('php-code', (event, data) => run(event, data));

export default function startWorkers(cwd, ipc) {
	tinkerWorker = startTinker(cwd, ipc);
	
	// TODO:
	// languageServer = startLanguageServer(ipc);
	// ipcMain.on('language-protocol', (event, data) => {
	// 	languageServer.write(data);
	// });
	
	run = (event, data) => {
		if (null === tinkerWorker) {
			log.debug('No worker is running. Starting a new one.');
			startWorkers(cwd, ipc);
		}
		setImmediate(() => tinkerWorker.run(data));
	};
	
	const onStdin = (event, data) => {
		tinkerWorker.stdin(data);
	};
	ipcMain.on('stdin', onStdin);
	
	const onResize = (event, data) => {
		tinkerWorker.resize(data.cols, data.rows);
	};
	ipcMain.on('terminal-size', onResize);
	
	const cleanup = () => {
		ipcMain.removeListener('stdin', onStdin);
		ipcMain.removeListener('terminal-size', onResize);
		tinkerWorker = null;
	};
	
	tinkerWorker.proc.onExit(cleanup);
	
	return function dispose() {
		if (tinkerWorker) {
			tinkerWorker.proc.kill();
		}
	};
};
