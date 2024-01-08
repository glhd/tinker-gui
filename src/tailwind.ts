import resolveConfig from 'tailwindcss/resolveConfig'
// @ts-ignore
import config from '../tailwind.config.js';

const resolved = resolveConfig(config);

export default resolved.theme;
