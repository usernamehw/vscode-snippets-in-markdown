import { CompletionItem, CompletionItemKind, Disposable, languages, TextEditor } from 'vscode';
import { snippetVariables } from '../constants';

let snippetVariablesAutocompleteDisposable: Disposable | undefined;
let languageScopesAutocompleteDisposable: Disposable | undefined;

export function updateAutocomplete(editor?: TextEditor) {
	snippetVariablesAutocompleteDisposable?.dispose();
	languageScopesAutocompleteDisposable?.dispose();

	if (editor) {
		snippetVariablesAutocompleteDisposable = languages.registerCompletionItemProvider({
			language: 'markdown',
			pattern: '**/snippets.md',
		}, {
			provideCompletionItems(document, position, token, context) {
				return snippetVariables.map(compl => {
					const completion = new CompletionItem(compl[0], CompletionItemKind.Constant);
					completion.detail = compl[1];
					return completion;
				});
			},
		},
		'$',
		);

		languageScopesAutocompleteDisposable = languages.registerCompletionItemProvider({
			language: 'markdown',
			pattern: '**/snippets.md',
		}, {
			async provideCompletionItems(document, position, token, context) {
				const linePrefix = document.lineAt(position).text.slice(0, position.character);
				if (linePrefix.endsWith('```') || /```([a-z_-]+,)+$/.test(linePrefix)) {
					const langs = await languages.getLanguages();
					return langs.map(lang => new CompletionItem(lang));
				}
				return [];
			},
		},
		'`',
		',',
		);
	}
}
