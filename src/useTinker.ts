import {useEffect, useRef} from 'react';
import {tempdir} from '@tauri-apps/api/os';
import {join} from '@tauri-apps/api/path';
import {writeTextFile} from '@tauri-apps/api/fs';
import {IPty, spawn} from "tauri-pty";

export default function useTinker(cwd: string | undefined) {
	const tinker = useRef<IPty>();
	
	useEffect(() => {
		if (!cwd) {
			return;
		}
		
		const pty = spawn('php', ['artisan', 'tinker'], {
			cwd,
			cols: 80,
			rows: 20,
		});
		
		tinker.current = pty;
		
		return () => {
			pty.kill();
			tinker.current = undefined;
		};
	}, [cwd]);
	
	async function run(code: string) {
		const suffix = (Math.random()).toString(36).substring(2);
		const filename = await join(await tempdir(), `tinker-${suffix}.php`);
		
		await writeTextFile(filename, code);
		
		console.log(filename);
		
		return filename;
	}
	
	return {
		tinker: tinker.current,
		run,
	};
}
