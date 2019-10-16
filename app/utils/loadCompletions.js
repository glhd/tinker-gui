// TODO: https://github.com/microsoft/monaco-editor/blob/master/test/playground.generated/extending-language-services-completion-provider-example.html
function loadCompletions(cwd, ipc) {
	let buffer = '';
	
	const proc = spawn('php', [], {
		stdio: 'pipe',
		cwd,
	});
	
	proc.stdout.on('data', (data) => {
		buffer += data.toString();
	});
	
	proc.stdin.write(`<?php
		require_once __DIR__.'/vendor/autoload.php';
		echo json_encode([
			'get_defined_functions' => get_defined_functions(),
			'get_declared_classes' => get_declared_classes(),
		]);
	`);
	proc.stdin.end();
	
	proc.on('close', code => {
		try {
			const functions = JSON.parse(buffer);
			ipc.send('completions', functions);
		} catch (e) {
			// Just ignore errors, since autocomplete is just a bonus
		}
	});
}
