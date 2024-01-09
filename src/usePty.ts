import { useEffect, useRef, useState } from 'react';
import { homeDir } from '@tauri-apps/api/path';
import { exists } from '@tauri-apps/api/fs';
import { IPty as ITauryPty, spawn } from "tauri-pty";
import { IDisposable, NoopDisposable } from "./disposables.ts";

export interface IPty {
	run: (code: string) => Promise<void>,
	write: (data: string) => void,
	onData: (callback: (data: string) => any) => IDisposable,
	resize: (cols: number, rows: number) => void,
}

export default function usePty(cwd: string): IPty {
	const [buffer, setBuffer] = useState<string[]>([]);
	const onData = useRef<((data: string) => any)>(() => () => null);
	const pty = useRef<ITauryPty>();
	
	useEffect(() => {
		let onDispose = [
			() => {
				console.log(`Disposing of PTY instance…`)
				pty.current = undefined;
			},
		];
		
		let dispose = () => {
			onDispose.forEach(dispose => dispose());
		}
		
		if (! pty.current) {
			(async () => {
				console.log(`Creating new PTY instance…`);
				
				let PATH = await guessPath();
				console.log(`Using $PATH: ${ PATH }`);
				
				const session = spawn('php', ['artisan', 'tinker'], {
					cwd,
					cols: 80,
					rows: 20,
					env: { PATH }
				});
				
				const disposables = [
					session.onData((data) => {
						console.log(`PTY DATA: ${data}`);
						onData.current
							? onData.current(data)
							: setBuffer([...buffer, data])
					}),
					session.onExit(()  => {
						console.warn(`PTY EXITED`);
					}),
				];
				
				onDispose.push(() => disposables.forEach(d => d.dispose()));
				
				pty.current = session;
				
				onDispose.push(() => {
					console.log(`Killing PTY session…`)
					session.kill();
				});
			})();
		}
		
		return dispose;
	}, [cwd, pty.current]);
	
	return {
		async run(code) {
			pty.current?.write(`eval(json_decode('${ JSON.stringify(code) }'));\n`);
		},
		write(data) {
			pty.current?.write(data);
		},
		onData(callback) {
			onData.current = callback;
			
			if (buffer.length) {
				buffer.forEach(data => callback(data));
			}
			
			setBuffer([]);
			
			return NoopDisposable;
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
