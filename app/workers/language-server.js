// const { DataCallback, Event, Message } = require('vscode-jsonrpc');
// const { PartialMessageInfo } = require('vscode-jsonrpc/lib/messageReader.js');
// const { ipcMain } = require('electron');
// const fs = require('fs');
const path = require('path');
// const { spawn } = require('child_process');

// const rpc = require('vscode-ws-jsonrpc');

const server = require('vscode-ws-jsonrpc/lib/server');

module.exports = function startLanguageServer(ipc) {
	let listener = noop => noop;
	
	const reader = {
		dispose: () => {
		},
		onError: (cb) => {
		},
		onClose: (cb) => {
		},
		listen: (callback) => {
			listener = callback;
		}
	};
	
	const writer = {
		dispose: () => {
		},
		onError: (cb) => {
		},
		onClose: (cb) => {
		},
		write: (msg) => {
			ipc.send('language-protocol', JSON.stringify(msg));
		}
	};
	
	const socketConnection = server.createConnection(reader, writer, noop => noop);
	const serverConnection = server.createServerProcess(
		'Tinker',
		'php',
		[path.resolve(__dirname, '../vendor/felixfbecker/language-server/bin/php-language-server.php')]
	);
	
	server.forward(socketConnection, serverConnection, message => {
		return message;
	});
	
	const write = (data) => {
		listener(JSON.parse(data));
	};
	
	return {
		write,
	};
};
