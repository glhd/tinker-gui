
const BuiltinModule = require('module');
// const path = require('path');

// debugger;
const builtInResolve = BuiltinModule._resolveFilename;

BuiltinModule._resolveFilename = function(request, parentModule, isMain, options) {
	if ('vscode' === request) {
		request = 'monaco-languageclient/lib/vscode-compatibility.js';
		return builtInResolve.call(this, request, parentModule, isMain, options);
	}
	
	return builtInResolve.call(this, request, parentModule, isMain, options);
};
