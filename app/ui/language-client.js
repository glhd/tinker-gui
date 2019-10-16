import * as monaco from 'monaco-editor/esm/vs/editor/edcore.main';
import WebSocket from 'electron-ipcrenderer-websocket';
import { listen } from 'vscode-ws-jsonrpc';
// import 'monaco-languageclient/lib/register-vscode';
import { CloseAction, createConnection, ErrorAction, MonacoLanguageClient, MonacoServices } from 'monaco-languageclient';

export default function registerLanguageClient(editor) {
	monaco.languages.register({
		id: 'php',
		extensions: [
			'.php',
			'.php4',
			'.php5',
			'.php7',
		],
		aliases: [
			'PHP'
		],
		mimetypes: [
			'text/php',
			'text/x-php',
			'application/php',
			'application/x-php',
			'application/x-httpd-php',
			'application/x-httpd-php-source',
		],
	});
	
	MonacoServices.install(editor);
	
	const webSocket = new WebSocket('language-protocol');
	
	listen({
		webSocket,
		onConnection: connection => {
			const languageClient = createLanguageClient(connection);
			const disposable = languageClient.start();
			connection.onClose(() => disposable.dispose());
		}
	});
	
	function createLanguageClient(connection) {
		return new MonacoLanguageClient({
			name: "Tinker Language Client",
			clientOptions: {
				documentSelector: ['php'],
				errorHandler: {
					error: () => ErrorAction.Continue,
					closed: () => CloseAction.DoNotRestart
				}
			},
			connectionProvider: {
				get: (errorHandler, closeHandler) => {
					return Promise.resolve(createConnection(connection, errorHandler, closeHandler));
				}
			}
		});
	}
}
