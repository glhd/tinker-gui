/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: {
				'bg': '#1e1e1e',
				'fg': '#d4d4d4',
			}
		},
	},
	plugins: [],
};
