import path from 'path';
import webpack from 'webpack';
import { dependencies } from '../package.json';
import { resolve } from './webpack.config.resolve.js';

export default {
	externals: [...Object.keys(dependencies || {})],
	
	module: {
		rules: [
			{
				test: /\.js$/,
				include: /monaco-languageclient|vscode-ws-jsonrpc|vscode-jsonrpc|vscode-languageserver-protocol|vscode-languageserver-types|vscode-languageclient/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
						plugins: [
							'@babel/plugin-transform-runtime',
							'@babel/plugin-transform-classes'
						],
						// see https://github.com/babel/babel/issues/8900#issuecomment-431240426
						sourceType: 'unambiguous',
						cacheDirectory: true
					}
				}
			},
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						sourceType: 'unambiguous',
						cacheDirectory: true
					}
				}
			}
		]
	},
	
	output: {
		path: path.join(__dirname, '..', 'app'),
		// https://github.com/webpack/webpack/issues/1114
		libraryTarget: 'commonjs2',
	},
	
	resolve,
	
	plugins: [
		new webpack.EnvironmentPlugin({
			NODE_ENV: 'production',
		}),
		
		new webpack.NamedModulesPlugin()
	]
};
