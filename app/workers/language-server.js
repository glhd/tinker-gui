const { ipcMain } = require('electron');
const net = require('net');
const path = require('path');
const { spawn } = require('child_process');
const { createConnection, createSocketConnection, forward } = require('vscode-ws-jsonrpc/lib/server');
const log = require('electron-log');
const { isPackaged, isDebug } = require('../utils/mode.js');

const executablePath = 'php';
const memoryLimit = '4095M';
const vendorRoot = isPackaged
	? process.resourcesPath
	: path.resolve(__dirname, '..', '..');

export default function(cwd, ipc) {
	let listenCallback = () => null;
	
	ipcMain.on('language-protocol', (event, data) => {
		listenCallback(JSON.parse(`${ data }`));
	});
	
	const reader = {
		onError: (event) => null,
		onClose: (event) => null,
		onPartialMessage: (message) => null,
		listen: (callback) => {
			listenCallback = callback;
		},
		dispose: () => {
			listenCallback = () => null;
		},
	};
	const writer = {
		onError: (event) => null,
		onClose: (event) => null,
		write: (msg) => ipc.send('language-protocol', JSON.stringify(msg)),
		dispose: () => null,
	};
	
	const ipcConnection = createConnection(reader, writer, () => null);
	
	spawnLanguageServer().then(socket => {
		const tcpConnection = createSocketConnection(socket, socket, () => null);
		
		forward(ipcConnection, tcpConnection, message => {
			if (isDebug) {
				log.info(`[RPC] ${ JSON.stringify(message) }`);
			}
			
			return message;
		});
	});
}

function spawnLanguageServer() {
	return new Promise(resolve => {
		// Use a TCP socket because of problems with blocking STDIO
		const server = net.createServer(socket => {
			log.info('Connected to language server');
			
			socket.on('end', () => log.info('Disconnected from language server'));
			server.close();
			
			resolve(socket);
		});
		
		// Listen on random port
		server.listen(0, '127.0.0.1', () => {
			// The server is implemented in PHP
			const serverPath = path.join(vendorRoot, 'vendor', 'felixfbecker', 'language-server', 'bin', 'php-language-server.php');
			
			const childProcess = spawn(executablePath, [
				serverPath,
				`--tcp=127.0.0.1:${ server.address().port }`,
				`--memory-limit=${ memoryLimit }`,
			]);
			
			childProcess.stderr.on('data', (chunk) => {
				if (isDebug) {
					log.info(`[PHP] ${ chunk }`);
				}
			});
			
			childProcess.on('exit', (code, signal) => {
				const reason = signal
					? `from signal ${ signal }`
					: `with exit code ${ code }`;
				log.info(`Language server exited ${ reason }`);
			});
		});
	});
}
