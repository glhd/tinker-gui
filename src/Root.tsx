import {open} from '@tauri-apps/api/dialog';
import {homeDir} from '@tauri-apps/api/path';
import {exit} from '@tauri-apps/api/process';
import {useEffect, useState} from "react";
import Loading from "./Loading.tsx";
import App from "./App.tsx";

export default function Root() {
	const [cwd, setCwd] = useState<string|null>(localStorage.getItem('cwd'));
	
	useEffect(() => {
		const timeout = setTimeout(async () => {
			if (cwd) {
				return;
			}
			
			const selection = await open({
				title: 'Select your Laravel application…',
				multiple: false,
				directory: true,
				defaultPath: await homeDir(),
			});
			
			if (null === selection || Array.isArray(selection)) {
				return await exit(1);
			}
			
			setCwd(selection);
			localStorage.setItem('cwd', selection);
		}, 10);
		
		return () => clearTimeout(timeout);
	}, []);
	
	return cwd ? <App cwd={cwd} /> : <Loading />;
}
