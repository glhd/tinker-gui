import { useEffect, useState } from "react";
import { open } from "@tauri-apps/api/dialog";
import { homeDir } from "@tauri-apps/api/path";
import useTauriEventListener from "./useTauriEventListener.ts";

export default function useWorkingDirectory() {
	const [cwd, setCwd] = useState<string|null>(localStorage.getItem('cwd'));
	
	const prompt = async (): Promise<any> => {
		const selection = await open({
			title: 'Select your Laravel application…',
			multiple: false,
			directory: true,
			defaultPath: await homeDir(),
		});
		
		if (null === selection || Array.isArray(selection)) {
			return await prompt();
		}
		
		setCwd(selection);
		localStorage.setItem('cwd', selection);
	};
	
	useEffect(() => {
		if (! cwd) {
			const timeout = setTimeout(prompt, 10);
			return () => clearTimeout(timeout);
		}
	}, [cwd]);
	
	useTauriEventListener('open', () => setCwd(null));
	
	return '' === cwd ? null : cwd;
}
