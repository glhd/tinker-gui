const { ipcMain } = require('electron');
// const net = require('net');
const path = require('path');
const { createConnection, createServerProcess, forward } = require('vscode-ws-jsonrpc/lib/server');
const log = require('electron-log');
const { isPackaged } = require('../utils/mode.js');

const executablePath = 'php';
const memoryLimit = '4095M';

const vendorRoot = isPackaged
	? process.resourcesPath
	: path.resolve(__dirname, '..', '..');
const serverPath = path.join(vendorRoot, 'vendor', 'felixfbecker', 'language-server', 'bin', 'php-language-server.php');
const serverArgs = [
	serverPath,
	// TODO: This may need to come back so that STDIO doesn't get blocked
	// '--tcp=127.0.0.1:' + server.address().port,
	'--memory-limit=' + memoryLimit,
];

log.warn('RESOURCE PATH', process.resourcesPath);

export default function(cwd, ipc) {
	const serverOptions = {
		cwd,
	};
	
	let listenCallback = () => null;
	
	const reader = {
		onError: (event) => {
			// log.error('Reader error: ', event);
		},
		onClose: (event) =>{
			// log.info('Close: ', event);
		},
		onPartialMessage: (message) => {
			// log.info('Partial message:', message);
		},
		listen: (callback) => {
			listenCallback = callback;
		},
		dispose: () => {
			// log.info('Reader disposed.');
			listenCallback = () => null;
		},
	};
	const writer = {
		onError: (event) => {
			// log.error('Writer error: ', event);
		},
		onClose: (event) => {
			// log.info('Close writer: ', event);
		},
		write: (msg) => {
			const json = JSON.stringify(msg);
			// log.info(`[server] ${json}`);
			ipc.send('language-protocol', json);
		},
		dispose: () => {
			// log.info('Writer disposed.');
		},
	};
	
	const socketConnection = createConnection(reader, writer, () => null);
	const serverConnection = createServerProcess('PHP Language Server', executablePath, serverArgs, serverOptions);
	
	forward(socketConnection, serverConnection, message => {
		log.info(`[RPC] ${JSON.stringify(message)}`);
		return message;
	});
	
	ipcMain.on('language-protocol', (event, data) => {
		listenCallback(JSON.parse(`${data}`));
	});
	
	// Use a TCP socket because of problems with blocking STDIO
	// const server = net.createServer(socket => {
	// 	// 'connection' listener
	// 	log.info('PHP process connected');
	// 	socket.on('end', () => {
	// 		log.info('PHP process disconnected');
	// 	});
	// 	server.close();
	// 	// resolve({ reader: socket, writer: socket });
	// 	serverSocket = socket;
	// });
	
	// Listen on random port
	// server.listen(0, '127.0.0.1', () => {
	// 	// The server is implemented in PHP
	// 	childProcess = spawn(executablePath, [
	// 		serverPath,
	// 		'--tcp=127.0.0.1:' + server.address().port,
	// 		'--memory-limit=' + memoryLimit,
	// 	]);
	//	
	// 	writerCallback = (data) => {
	// 		ipc.send('language-protocol', `${data}`);
	// 	};
	//	
	// 	childProcess.stderr.on('data', (chunk) => {
	// 		const str = chunk.toString();
	// 		log.error('[PHP] ', str);
	// 	});
	//	
	// 	childProcess.stdout.on('data', (chunk) => {
	// 		const str = chunk.toString();
	// 		log.info('[PHP] ', str);
	// 		listenCallback(str);
	// 	});
	//	
	// 	childProcess.on('exit', (code, signal) => {
	// 		log.info(
	// 			`Language server exited ` + (signal ? `from signal ${ signal }` : `with exit code ${ code }`)
	// 		);
	// 	});
	// });
	
	// return { childProcess, serverSocket };
}
