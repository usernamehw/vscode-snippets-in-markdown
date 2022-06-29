import { commands, ExtensionContext } from 'vscode';
import { openSnippetsFile } from './commands/openSnippetsFile';

export const enum CommandId {
	OpenSnippetsFile = 'snippetsInMarkdown.openSnippetsFile',
}

export function registerAllCommands(context: ExtensionContext) {
	context.subscriptions.push(commands.registerCommand(CommandId.OpenSnippetsFile, () => {
		openSnippetsFile(context);
	}));
}


