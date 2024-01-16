import { DependencyList, useEffect } from "react";
import { EventCallback, listen, UnlistenFn } from "@tauri-apps/api/event";

let debounce: Map<string, number> = new Map();

export default function useTauriEventListener(name: string, callback: EventCallback<any>, deps: DependencyList = [], timeout: number = 150)
{
	useEffect(() => {
		let unlisten: UnlistenFn = () => null;
		
		// Listen is async so we have to jump thru some hoops to 
		// make useEffect return a sync cleanup function
		(async () => {
			unlisten = await listen(name, (event) => {
				clearTimeout(debounce.get(name));
				debounce.set(name, setTimeout(() => callback(event), timeout));
			});
		})();
		
		return () => {
			console.log(`Cleaning up "${name}" listener…`);
			debounce.delete(name);
			unlisten();
		}
	}, [name, callback, ...deps]);
}
