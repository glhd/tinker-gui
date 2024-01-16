import Loading from "./Loading.tsx";
import Tinker from "./Tinker.tsx";
import useWorkingDirectory from "./useWorkingDirectory.ts";
import { useEffect } from "react";
import { appWindow } from '@tauri-apps/api/window';
import { basename } from "@tauri-apps/api/path";

export default function Root() {
	const cwd = useWorkingDirectory();
	
	useEffect(() => {
		(async () => {
			if (cwd) {
				const name = await basename(cwd);
				await appWindow.setTitle(`Tinker (${name})`);
			} else {
				await appWindow.setTitle('Tinker');
			}
		})();
	}, [cwd]);
	
	return cwd ? <Tinker cwd={ cwd } /> : <Loading />;
}
