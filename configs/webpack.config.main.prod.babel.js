/**
 * Webpack config for production electron main process
 */

import path from 'path';
import webpack from 'webpack';
import merge from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import baseConfig from './webpack.config.base';
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';

CheckNodeEnv('production');

export default merge.smart(baseConfig, {
	devtool: 'source-map',
	
	mode: 'production',
	
	target: 'electron-main',
	
	entry: './app/main.dev',
	
	output: {
		path: path.join(__dirname, '..'),
		filename: './app/main.prod.js'
	},
	
	optimization: {
		minimizer: process.env.E2E_BUILD
			? []
			: [
				new TerserPlugin({
					parallel: true,
					sourceMap: true,
					cache: true
				})
			]
	},
	
	plugins: [
		new BundleAnalyzerPlugin({
			analyzerMode: 'true' === process.env.OPEN_ANALYZER 
                ? 'server' 
                : 'disabled',
			openAnalyzer: 'true' === process.env.OPEN_ANALYZER
        }),
        
		new webpack.EnvironmentPlugin({
			NODE_ENV: 'production',
			DEBUG_PROD: false
		})
	],
	
	/**
	 * Disables webpack processing of __dirname and __filename.
	 * If you run the bundle in node.js it falls back to these values of node.js.
	 * https://github.com/webpack/webpack/issues/2010
	 */
	node: {
		__dirname: false,
		__filename: false
	}
});
