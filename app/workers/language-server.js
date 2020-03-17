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
		if (isDebug) {
			log.info(`[RPC] <- ${ data }`);
		}
		listenCallback(JSON.parse(`${ data }`));
	});
	
	const reader = {
		onError: (event) => null,
		onClose: (event) => null,
		onPartialMessage: (message) => null,
		listen: (callback) => {
			log.info('Listening for RPC messages');
			listenCallback = callback;
		},
		dispose: () => {
			listenCallback = () => null;
		},
	};
	const writer = {
		onError: (event) => null,
		onClose: (event) => null,
		write: (msg) => {
			const json = JSON.stringify(msg);
			if (isDebug) {
				log.info(`[RPC] -> ${ json }`);
			}
			ipc.send('language-protocol', json);
		},
		dispose: () => null,
	};
	
	const ipcConnection = createConnection(reader, writer, () => null);
	
	spawnLanguageServer().then(({ socket, dispose }) => {
		const tcpConnection = createSocketConnection(socket, socket, dispose);
		forward(ipcConnection, tcpConnection, message => message);
		ipc.send('language-server-ready', JSON.stringify(true));
	});
}

function spawnLanguageServer() {
	return new Promise(resolve => {
		let childProcess;
		
		// Use a TCP socket because of problems with blocking STDIO
		const server = net.createServer(socket => {
			log.info('Connected to language server');
			
			socket.on('end', () => log.info('Disconnected from language server'));
			
			// Stop the server from accepting any more connections
			server.close();
			
			const dispose = () => {
				socket.end();
				childProcess.kill('SIGTERM');
			};
			
			resolve({ socket, dispose });
		});
		
		// Listen on random port
		server.listen(0, '127.0.0.1', () => {
			// The server is implemented in PHP
			const serverPath = path.join(vendorRoot, 'vendor', 'felixfbecker', 'language-server', 'bin', 'php-language-server.php');
			
			log.info(`Starting language server and connecting to port ${ server.address().port }`);
			
			childProcess = spawn(executablePath, [
				serverPath,
				`--tcp=127.0.0.1:${ server.address().port }`,
				`--memory-limit=${ memoryLimit }`,
			]);
			
			childProcess.stderr.on('data', (chunk) => {
				chunk.toString()
					.split('\n')
					.forEach(line => log.info(`[PHP] ${ line }`));
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
