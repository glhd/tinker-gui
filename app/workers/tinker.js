const { ipcMain } = require('electron');
const fs = require('fs');
const pty = require('node-pty');
const temp = require('temp');
const log = require('electron-log');

temp.track(true);

module.exports = function runTinker(cwd, ipc, code = null) {
	log.info(`Starting new tinker process in ${cwd} (${null === code ? 'with' : 'without'} running code)`);
	
	let sentCode = false;
	
	const proc = pty.spawn('php', ['artisan', 'tinker'], {
		name: 'xterm-color',
		cols: 80,
		rows: 30,
		env: process.env,
		cwd,
	});
	
	const kill = () => proc.kill();
	process.on('SIGTERM', kill);
	process.on('SIGHUP', kill);
	
	const stdin = (event, data) => proc.write(data);
	ipcMain.on('stdin', stdin);
	
	const resize = (event, data) => proc.resize(data.cols, data.rows);
	ipcMain.on('terminal-size', resize);
	
	proc.onData(data => {
		ipc.send('stdout', data);
		
		if (!sentCode && code) {
			sentCode = true;
			
			const { path, fd } = temp.openSync();
			fs.writeSync(fd, code);
			fs.closeSync(fd);
			
			setTimeout(() => proc.write(`include '${path}';\n`), 100);
		}
	});
	
	proc.onExit(() => {
		log.info('Tinker process has exited. Cleaning up.');
		
		ipcMain.removeListener('stdin', stdin);
		ipcMain.removeListener('terminal-size', resize);
		process.off('SIGTERM', kill);
		process.off('SIGHUP', kill);
	});
	
	return {
		proc,
		dispose: () => {
			proc.kill();
		},
		// stdin: (data) => {
		// 	proc.write(data);
		// },
		// resize: (cols, rows) => {
		// 	proc.resize(cols, rows);
		// },
	};
};
