import { ipcMain } from 'electron';
import startTinker from '../workers/tinker.js';

let tinkerWorker;

export default function startWorkers(cwd, ipc) {
	tinkerWorker = startTinker(cwd, ipc);
	
	// TODO:
	// languageServer = startLanguageServer(ipc);
	// ipcMain.on('language-protocol', (event, data) => {
	// 	languageServer.write(data);
	// });
	
	// FIXME: Could be a memory leak
	const run = (event, data) => {
		if (null === tinkerWorker) {
			tinkerWorker = startTinker(cwd, ipc);
		}
		tinkerWorker.run(data);
	};
	ipcMain.on('php-code', run);
	
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
		// ipcMain.removeListener('php-code', run);
		tinkerWorker = null;
	};
	
	tinkerWorker.proc.onExit(cleanup);
	
	return function dispose() {
		if (tinkerWorker) {
			tinkerWorker.proc.kill();
		}
	};
};
