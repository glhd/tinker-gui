const path = require('path');

module.exports = {
	resolve: {
		extensions: ['.js', '.jsx', '.json'],
		alias: {
			'vscode': path.resolve(__dirname, '../node_modules/monaco-languageclient/lib/vscode-compatibility.js'),
			'react-dom': '@hot-loader/react-dom',
		},
	},
};
