
const isDebug = 'development' === process.env.NODE_ENV || 'true' === process.env.DEBUG_PROD;
const isDev = 'development' === process.env.NODE_ENV;
const isProd = 'production' === process.env.NODE_ENV;

// See https://github.com/ganeshrvel/npm-electron-is-packaged
const isPackaged = (process.mainModule && -1 !== process.mainModule.filename.indexOf('app.asar'))
	|| process.argv.filter(a => a.indexOf('app.asar') !== -1).length > 0;

module.exports = {
	isDebug,
	isDev,
	isProd,
	isPackaged,
};
