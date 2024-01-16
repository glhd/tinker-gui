import { useState } from "react";

export default function useEditorValue(): [string, (value: string) => void] {
	const [value, setValue] = useState<string>(valueRetriever);
	
	return [
		value,
		(value: string) => {
			setValue(value);
			localStorage.setItem('value', value);
		}
	];
}

function valueRetriever() {
	const value = localStorage.getItem('value');
	
	return value ? value.replace(/^\s*<\?(php)?\s*/i, '') : '';
}
