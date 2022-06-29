import { ExtensionContext, window } from 'vscode';
import { registerAllCommands } from './commands';
import { onChangeActiveTextEditor } from './events';


export abstract class $state {
	static context = {} as any as ExtensionContext;
}

export function activate(context: ExtensionContext) {
	$state.context = context;

	registerAllCommands(context);

	onChangeActiveTextEditor(window.activeTextEditor);

	context.subscriptions.push(
		window.onDidChangeActiveTextEditor(onChangeActiveTextEditor),
	);
}

export function deactivate() { }
