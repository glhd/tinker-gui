import {useEffect, useRef} from 'react';
import {appLocalDataDir, BaseDirectory, homeDir, join} from '@tauri-apps/api/path';
import {createDir, exists, removeFile, writeTextFile} from '@tauri-apps/api/fs';
import {IPty, spawn} from "tauri-pty";
import {Terminal} from "@xterm/xterm";
// import {Command} from "@tauri-apps/api/shell";

let session: IPty;
let dispose: () => void;

export async function startNewSession(cwd: string, code: string, terminal: Terminal)
{
	// if (dispose) {
	// 	dispose();
	// 	dispose = () => {};
	// }
	
	await createDir('temp', {dir: BaseDirectory.AppLocalData, recursive: true});
	
	const suffix = (Math.random()).toString(36).substring(2);
	const filename = await join(await appLocalDataDir(), `temp`, `tinker-${suffix}.php`);
	
	console.log(`Writing to temp file (${filename})…`);
	await writeTextFile(filename, code);
	
	console.log(`Spawning…`);
	session = spawn('php', ['artisan', 'tinker', filename], {
		cwd,
		cols: terminal.cols,
		rows: terminal.rows,
		env: {
			PATH: await guessPath(),
		},
	});
	
	console.log(`php artisan tinker "${filename}"`);
	
	const disposables = [
		session.onData(data => terminal.write(data)),
		terminal.onData(data => session.write(data)),
		terminal.onResize(({cols, rows}) => session.resize(cols, rows)),
	];
	
	dispose = () => {
		console.log('Closing session…');
		session.kill();
		
		console.log(`Killing event listeners…`);
		disposables.forEach(d => d.dispose());
		
		// console.log(`Removing temp file (${filename})…`);
		// removeFile(filename);
		
		dispose = () => {};
	};
	
	return { session, dispose };
}

export default function useTinker(cwd: string | undefined) {
	const tinker = useRef<IPty>();
	
	useEffect(() => {
		if (!cwd) {
			return;
		}
		
		let dispose = () => {};
		
		(async () => {
			const pty = spawn('php', ['artisan', 'tinker'], {
				cwd,
				cols: 80,
				rows: 20,
				env: { PATH: await guessPath() }
			});
			
			// pty.onData(e => console.info(e));
			// pty.onExit(e => console.warn(e));
			
			tinker.current = pty;
			
			dispose = () => {
				pty.kill();
				tinker.current = undefined;
			};
		})();
		
		return () => dispose();
	}, [cwd]);
	
	async function run(code: string) {
		await createDir('temp', { dir: BaseDirectory.AppLocalData, recursive: true });
		
		const suffix = (Math.random()).toString(36).substring(2);
		const filename = await join(await appLocalDataDir(), `temp`, `tinker-${suffix}.php`);
		
		console.log(`Writing to temp file (${filename})…`);
		await writeTextFile(filename, code);
		
		console.log('Executing script…');
		tinker.current?.write(`include '${filename}';\n`);
		
		console.log(`Removing temp file (${filename})…`);
		await removeFile(filename);
	}
	
	return {
		tinker: tinker.current,
		run,
	};
}

async function guessPath(): Promise<string> {
	const home = await homeDir();
	
	const paths = [
		`${home}Library/Application Support/Herd/bin/`,
		`/opt/homebrew/bin/`,
		`/opt/homebrew/sbin/`,
		`${home}.composer/vendor/bin/`,
		`${home}bin/`,
		`/usr/local/bin/`,
		`/usr/bin/`,
		`/usr/local/sbin/`,
		`/usr/sbin/`,
		`/bin/`,
		`/sbin/`,
	];
	
	for (const path of paths) {
		if (await exists(`${path}php`)) {
			return path;
		}
	}
	
	throw 'Unable to discover PHP executable.';
}
