import Monaco from '@monaco-editor/react';

export default function Editor() {
	return (
		<Monaco 
			height="100vh"
			defaultLanguage="php"
			theme="vs-dark"
			defaultValue="// some comment" 
		/>
	);
}
