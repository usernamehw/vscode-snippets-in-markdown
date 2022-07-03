import { Disposable, Hover, languages, MarkdownString, TextEditor } from 'vscode';
import { snippetVariables } from '../constants';

let hoverDisposable: Disposable | undefined;
const variablesRegexp = new RegExp(snippetVariables.map(variable => variable[0]).join('|'), 'g');

export function updateHover(editor?: TextEditor) {
	hoverDisposable?.dispose();

	if (editor) {
		hoverDisposable = languages.registerHoverProvider({
			language: 'markdown',
			pattern: '**/snippets.md',
		}, {
			provideHover(document, position, token) {
				const matchRange = document.getWordRangeAtPosition(position, variablesRegexp);
				if (matchRange) {
					const word = document.getText(matchRange);
					if (!word) {
						return undefined;
					}
					const found = snippetVariables.find(variable => variable[0] === word);
					if (!found) {
						return undefined;
					}
					return new Hover(new MarkdownString(found[1]));
				}
				return undefined;
			},
		});
	}
}
