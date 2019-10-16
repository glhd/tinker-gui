
const isDebug = 'development' === process.env.NODE_ENV || 'true' === process.env.DEBUG_PROD;
const isDev = 'development' === process.env.NODE_ENV;
const isProd = 'production' === process.env.NODE_ENV;

module.exports = {
	isDebug: true, // FIXME
	isDev,
	isProd,
};
