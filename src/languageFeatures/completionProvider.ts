import { CompletionItem, CompletionItemKind, Disposable, languages, TextEditor } from 'vscode';
import { snippetVariables } from '../constants';


let autocompleteDisposable: Disposable | undefined;

export function updateAutocomplete(editor?: TextEditor) {
	autocompleteDisposable?.dispose();

	if (editor) {
		autocompleteDisposable = languages.registerCompletionItemProvider({
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
	}
}
