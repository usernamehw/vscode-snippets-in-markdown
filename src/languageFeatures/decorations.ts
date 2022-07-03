import { Range, TextEditor, TextEditorDecorationType, ThemeColor, window } from 'vscode';
import { snippetVariables } from '../constants';
import { Constants } from '../types';

let snippetVariableTextDecoration: TextEditorDecorationType;

export function createDecorations() {
	snippetVariableTextDecoration = window.createTextEditorDecorationType({
		color: new ThemeColor(Constants.SnippetVariableColorId),
		fontWeight: 'bold',
	});
}

export function updateDecorations(editor: TextEditor) {
	const ranges: Range[] = [];

	const variablesRegexp = new RegExp(snippetVariables.map(variable => `\\$\\{${variable[0]}(:[a-zA-Z]+?)?\\}|\\$${variable[0]}`).join('|'), 'g');

	for (let lineNumber = 0; lineNumber < editor.document.lineCount; lineNumber++) {
		const line = editor.document.lineAt(lineNumber);
		for (const match of line.text.matchAll(variablesRegexp)) {
			// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
			const matchRange = new Range(lineNumber, match.index!, lineNumber, match.index! + match[0].length);
			ranges.push(matchRange);
		}
	}

	editor.setDecorations(snippetVariableTextDecoration, ranges);
}

export function disposeDecorations() {
	snippetVariableTextDecoration?.dispose();
}
