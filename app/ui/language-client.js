import * as url from 'url';
import * as monaco from 'monaco-editor/esm/vs/editor/edcore.main';
import { listen } from 'vscode-ws-jsonrpc';
import { createConnection, MonacoLanguageClient, MonacoServices, RevealOutputChannelOn } from 'monaco-languageclient';

const { ipcRenderer } = window.require('electron');
const log = require('electron-log');

export default function registerLanguageClient(editor) {
	
	log.info('Installing language client');
	MonacoServices.install(editor);
	
	return new Promise(resolve => {
		const webSocket = {
			onopen: () => null,
			onmessage: () => null,
			onerror: () => null,
			onclose: () => null,
			send: (content) => {
				// log.info('Sending to lang server: ', content);
				ipcRenderer.send('language-protocol', `${ content }`);
			},
			close: () => {
				log.info('Websocket close.');
			},
		};
		
		setTimeout(() => webSocket.onopen(), 1);
		
		ipcRenderer.on('language-protocol', (event, data) => {
			const message = data.toString();
			log.info('From lang server: ', message);
			webSocket.onmessage(message);
		});
		
		listen({
			webSocket,
			logger: {
				error: (message) => log.error(message),
				warn: (message) => log.warn(message),
				info: (message) => log.info(message),
				log: (message) => log.log(message),
			},
			onConnection: connection => {
				log.info('Starting client connection', connection);
				const languageClient = createLanguageClient(connection);
				const disposable = languageClient.start();
				
				connection.onClose(() => disposable.dispose());
				
				resolve(disposable);
			}
		});
		
		function createLanguageClient(connection) {
			return new MonacoLanguageClient({
				name: "Tinker Language Client",
				clientOptions: {
					documentSelector: [
						{ scheme: 'file', language: 'php' },
						{ scheme: 'untitled', language: 'php' },
					],
					revealOutputChannelOn: RevealOutputChannelOn.Never,
					uriConverters: {
						// VS Code by default %-encodes even the colon after the drive letter
						// NodeJS handles it much better
						code2Protocol: uri => url.format(url.parse(uri.toString(true))),
						protocol2Code: str => monaco.Uri.parse(str),
					},
					synchronize: {
						// Synchronize the setting section 'php' to the server
						configurationSection: 'php',
						// Notify the server about changes to PHP files in the workspace
						// fileEvents: vscode.workspace.createFileSystemWatcher('**/*.php'),
					},
				},
				connectionProvider: {
					get: (errorHandler, closeHandler) => {
						return Promise.resolve(createConnection(connection, errorHandler, closeHandler));
					}
				}
			});
		}
	});
}
