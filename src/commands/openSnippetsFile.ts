import fs from 'fs';
import path from 'path';
import { ExtensionContext, Uri, window, workspace } from 'vscode';
import { Constants } from '../types';

const defaultMarkdownContent = `
# Example of a snippet:
# $SCOPES $PREFIXES $NAME $DESCRIPTION
# Snippet parts can be omitted by using underscore sign \`_\`:
# _ $PREFIXES _ $DESCRIPTION
# Autocomplete for variables inside the code block is not shown when you type \`$\`, but it's there
\`\`\`javascript,typescript prefix1,prefix2 name description
console.log($0);
\`\`\`
`.trim();

export async function openSnippetsFile(context: ExtensionContext) {
	const snippetsFolderPath = getSnippetsFolderPath(context);
	const mdPath = path.join(snippetsFolderPath, Constants.GlobalMarkdownSnippetFileName);
	if (!fs.existsSync(mdPath)) {
		try {
			await fs.promises.writeFile(mdPath, defaultMarkdownContent);
		} catch (e) {
			window.showErrorMessage(String(e));
		}
	}
	await openFileInEditor(mdPath);
}

export function getSnippetsFolderPath(context: ExtensionContext) {
	return path.join(context.logUri.fsPath, '..', '..', '..', '..', 'User', 'snippets');
}
export async function openFileInEditor(absolutePath: string): Promise<void> {
	const document = await workspace.openTextDocument(Uri.file(absolutePath));
	await window.showTextDocument(document);
}
