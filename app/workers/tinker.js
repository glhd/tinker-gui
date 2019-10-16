const { ipcMain } = require('electron');
const fs = require('fs');
const { spawn } = require('child_process');
const pty = require('node-pty');
const temp = require('temp');

temp.track(true);

module.exports = function startTinker(cwd, ipc) {
	// Start loading completions in another process
	loadCompletions(cwd, ipc);
	
	const proc = pty.spawn('php', ['artisan', 'tinker'], {
		name: 'xterm-color',
		cols: 80,
		rows: 30,
		env: process.env,
		cwd,
	});
	
	proc.on('data', data => {
		ipc.send('stdout', data);
	});
	
	const resize = (cols, rows) => {
		proc.resize(cols, rows);
	};
	
	const run = (data) => {
		temp.open({ prefix: 'tnkr', suffix: 'php' }, function(err, info) {
			if (err) {
				console.error(err);
				return;
			}
			
			fs.writeSync(info.fd, data);
			fs.closeSync(info.fd);
			
			proc.write(`include '${ info.path }';\n`);
		});
	};
	
	const stdin = (data) => {
		proc.write(data);
	};
	
	return {
		proc,
		stdin,
		run,
		resize,
	};
};

// TODO: https://github.com/microsoft/monaco-editor/blob/master/test/playground.generated/extending-language-services-completion-provider-example.html
function loadCompletions(cwd, ipc) {
	let buffer = '';
	
	const proc = spawn('php', [], {
		stdio: 'pipe',
		cwd,
	});
	
	proc.stdout.on('data', (data) => {
		buffer += data.toString();
	});
	
	proc.stdin.write(`<?php
		require_once __DIR__.'/vendor/autoload.php';
		echo json_encode([
			'get_defined_functions' => get_defined_functions(),
			'get_declared_classes' => get_declared_classes(),
		]);
	`);
	proc.stdin.end();
	
	proc.on('close', code => {
		try {
			const functions = JSON.parse(buffer);
			ipc.send('completions', functions);
		} catch (e) {
			// Just ignore errors, since autocomplete is just a bonus
		}
	});
}
