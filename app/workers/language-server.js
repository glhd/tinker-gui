const { ipcMain } = require('electron');
const net = require('net');
const path = require('path');
const { spawn } = require('mz/child_process');
const { createMessageConnection } = require('vscode-ws-jsonrpc');
const log = require('electron-log');

export default function() {
	const executablePath = 'php';
	const memoryLimit = '4095M';
	
	let childProcess;
	let serverSocket;
	
	let listenCallback = () => null;
	let writerCallback = () => null;
	
	// `reader` reads from client, `writer` writes to client
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
			log.info('Writing: ', msg);
			writerCallback(msg);
		},
		dispose: () => {
			// log.info('Writer disposed.');
		},
	};
	const logger = {
		error: (message) => {
			log.error(message);
		},
		warn: (message) => {
			log.warn(message);
		},
		info: (message) => {
			log.info(message);
		},
		log: (message) => {
			log.log(message);
		},
		debug: (message) => {
			log.debug(message);
		},
	};
	
	const connection = createMessageConnection(reader, writer, logger);
	connection.listen();
	
	ipcMain.on('language-protocol', (event, data) => {
		log.info('Data from client: ', data);
		// listenCallback(`${data}`);
		writer.write(`${data}`);
	});
	
	const serverPath = path.join(__dirname, '..', 'vendor', 'felixfbecker', 'language-server', 'bin', 'php-language-server.php');
	log.info(`Lang server: ${ serverPath }`);
	
	// Use a TCP socket because of problems with blocking STDIO
	const server = net.createServer(socket => {
		// 'connection' listener
		log.info('PHP process connected');
		socket.on('end', () => {
			log.info('PHP process disconnected');
		});
		server.close();
		// resolve({ reader: socket, writer: socket });
		serverSocket = socket;
	});
	
	// Listen on random port
	server.listen(0, '127.0.0.1', () => {
		// The server is implemented in PHP
		childProcess = spawn(executablePath, [
			serverPath,
			'--tcp=127.0.0.1:' + server.address().port,
			'--memory-limit=' + memoryLimit,
		]);
		
		writerCallback = (data) => {
			childProcess.stdin.write(`${data}\n`);
		};
		
		childProcess.stderr.on('data', (chunk) => {
			const str = chunk.toString();
			log.error('[PHP] ', str);
		});
		
		childProcess.stdout.on('data', (chunk) => {
			const str = chunk.toString();
			log.info('[PHP] ', str);
			listenCallback(str);
		});
		
		childProcess.on('exit', (code, signal) => {
			log.info(
				`Language server exited ` + (signal ? `from signal ${ signal }` : `with exit code ${ code }`)
			);
		});
	});
	
	return { childProcess, serverSocket };
}
