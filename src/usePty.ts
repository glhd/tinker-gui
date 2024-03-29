import { useEffect, useRef } from 'react';
import { homeDir } from '@tauri-apps/api/path';
import { exists } from '@tauri-apps/api/fs';
import { IPty as ITauryPty, spawn } from "tauri-pty";
import useBufferedCallback from "./useBufferedCallback.ts";
import { callbackToDisposable } from "./disposables.ts";
import toast from "react-hot-toast";
import useTauriEventListener from "./useTauriEventListener.ts";

export interface IPty {
	state: string,
	run: (code: string) => Promise<void>,
	write: (data: string) => void,
	onData: (callback: (data: string) => any) => void,
	resize: (cols: number, rows: number) => void,
}

export default function usePty(cwd: string): IPty {
	const [onData, setOnData, disposableData] = useBufferedCallback('pty');
	const pty = useRef<ITauryPty>();
	
	useTauriEventListener('reload', () => {
		console.log('reload event');
		const id = toast.loading('Reloading…');
		setTimeout(() => toast.dismiss(id), 750);
		// pty.current?.clear();
		pty.current?.kill();
	});
	
	useEffect(() => {
		const disposables = [
			callbackToDisposable(() => {
				console.log(`Disposing of PTY instance…`)
				pty.current = undefined;
			}),
			disposableData,
		];
		
		if (! pty.current) {
			const boot = async () => {
				console.log(`Creating new PTY instance…`);
				
				let PATH = await guessPath();
				console.log(`Using $PATH: ${ PATH }`);
				
				const session = spawn('php', ['artisan', 'tinker'], {
					cwd,
					cols: 80,
					rows: 20,
					env: { PATH }
				});
				
				pty.current = session;
				
				disposables.push(session.onData(onData));
				disposables.push(session.onExit(({ exitCode }) => {
					console.warn(`PTY exited with code ${ exitCode }`);
					setTimeout(() => boot(), 1);
				}));
				
				disposables.push(callbackToDisposable(() => {
					console.log(`Killing PTY session…`)
					session.kill();
				}));
			};
			
			boot();
		}
		
		return () => {
			disposables.forEach(d => d.dispose());
		};
	}, [cwd]);
	
	return {
		state: pty.current ? 'loaded' : 'loading',
		async run(code) {
			// const id = toast.loading('Running…');
			// setTimeout(() => toast.dismiss(id), 750);
			
			const lines = code
				.replace(/^\s*<\?(php)?\s*/, '')
				.split("\n")
				.filter(line => '' !== line.trim())
				.join('\\\n');
			
			pty.current?.write(`${ lines }\n`);
			//
			// await createDir('scratches', { dir: BaseDirectory.AppLocalData, recursive: true });
			//
			// const suffix = (Math.random()).toString(36).substring(2);
			// const filename = await join(await appLocalDataDir(), `scratches`, `tinker-${ suffix }.php`);
			//
			// console.log(`Writing to temp file (${ filename })…`);
			// await writeTextFile(filename, code);
			//
			// console.log('Executing script…');
			// pty.current?.write(`return include '${ filename }';\n`);
			//
			// setTimeout(async () => {
			// 	console.log(`Removing temp file (${ filename })…`);
			// 	await removeFile(filename);
			// }, 500);
		},
		write(data) {
			pty.current?.write(data);
		},
		onData(callback) {
			setOnData(callback);
		},
		resize(cols, rows) {
			pty.current?.resize(cols, rows);
		}
	};
}

async function guessPath(): Promise<string> {
	const home = await homeDir();
	
	const paths = [
		`${ home }Library/Application Support/Herd/bin/`,
		`/opt/homebrew/bin/`,
		`/opt/homebrew/sbin/`,
		`${ home }.composer/vendor/bin/`,
		`${ home }bin/`,
		`/usr/local/bin/`,
		`/usr/bin/`,
		`/usr/local/sbin/`,
		`/usr/sbin/`,
		`/bin/`,
		`/sbin/`,
	];
	
	for (const path of paths) {
		if (await exists(`${ path }php`)) {
			return path;
		}
	}
	
	throw 'Unable to discover PHP executable.';
}
