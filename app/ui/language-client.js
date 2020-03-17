import * as url from 'url';
import * as monaco from 'monaco-editor/esm/vs/editor/edcore.main';
// import * as vscode from 'monaco-languageclient/lib/vscode-compatibility';
import { listen } from 'vscode-ws-jsonrpc';
import { CloseAction, createConnection, ErrorAction, MonacoLanguageClient, MonacoServices, RevealOutputChannelOn, } from 'monaco-languageclient';

const { ipcRenderer } = window.require('electron');
const log = require('electron-log');

export default function registerLanguageClient(editor) {
	
	MonacoServices.install(editor);
	
	return new Promise(resolve => {
		ipcRenderer.once('language-server-ready', () => {
			const webSocket = {
				onopen: () => null,
				onmessage: () => null,
				onerror: () => null,
				onclose: () => null,
				send: (content) => {
					ipcRenderer.send('language-protocol', `${ content }`);
				},
				close: () => {
					log.info('Websocket close.');
				},
			};
			
			setTimeout(() => webSocket.onopen(), 1);
			
			ipcRenderer.on('language-protocol', (event, data) => {
				webSocket.onmessage({ data });
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
						// FIXME:
						// workspaceFolder: '',
						documentSelector: ['php'],
						errorHandler: {
							error: () => ErrorAction.Continue,
							closed: () => CloseAction.DoNotRestart
						},
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
	});
}
