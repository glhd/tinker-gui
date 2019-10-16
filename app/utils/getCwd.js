const { app, dialog } = require('electron');
const settings = require('electron-settings');

module.exports = function getCwd(prompt = false) {
	if (prompt || !settings.has('cwd')) {
		const selections = dialog.showOpenDialog({
			title: 'Open a Laravel Project',
			message: 'Open a Laravel Project',
			buttonLabel: 'Tinker',
			properties: ['openDirectory']
		});
		
		if (!selections.length) {
			console.error('No working directory selected.');
			app.exit(1);
			return;
		}
		
		settings.set('cwd', selections[0]);
	}
	
	return settings.get('cwd');
};
