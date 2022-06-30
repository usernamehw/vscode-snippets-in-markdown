import fs from 'fs';
import debounce from 'lodash/debounce';
import path from 'path';
import { Disposable, TextDocumentChangeEvent, TextEditor, workspace } from 'vscode';
import { getSnippetsFolderPath } from './commands/openSnippetsFile';
import { $state } from './extension';
import { updateAutocomplete } from './languageFeatures/completionProvider';
import { createDecorations, disposeDecorations, updateDecorations } from './languageFeatures/decorations';
import { Constants } from './types';

let onDidChangeTextDocumentDisposable: Disposable | undefined;

export function onChangeActiveTextEditor(editor?: TextEditor) {
	if (editor && isActiveEditorTheOneAndOnly(editor)) {
		activateEditorFeatures(editor);
	} else {
		deactivateEditorFeatures();
	}
}

/**
 * **true** when file is named `snippets.md` & is located in
 * the VSCode directory for snippets.
 */
export function isActiveEditorTheOneAndOnly(editor?: TextEditor): boolean {
	if (!editor) {
		return false;
	}
	const snippetsFolderPath = getSnippetsFolderPath($state.context);
	const mdPath = path.join(snippetsFolderPath, Constants.GlobalMarkdownSnippetFileName);
	return mdPath === editor.document.uri.fsPath;
}

export function activateEditorFeatures(editor: TextEditor) {
	createDecorations();
	updateDecorations(editor);

	onDidChangeTextDocumentDisposable?.dispose();
	onDidChangeTextDocumentDisposable = workspace.onDidChangeTextDocument(e => {
		onDidChangeTextDocument(e, editor);
	});

	updateAutocomplete(editor);
}
export function deactivateEditorFeatures() {
	updateAutocomplete();
	onDidChangeTextDocumentDisposable?.dispose();
	disposeDecorations();
}

function onDidChangeTextDocument(_: TextDocumentChangeEvent, editor: TextEditor) {
	updateDecorations(editor);
	generateSnippetsFile(editor);
}

export const generateSnippetsFile = debounce(async (editor?: TextEditor) => {
	const text = editor?.document.getText();
	if (!editor || !text) {
		return;
	}

	const snippets: Record<string, SnippetType> = {};

	const codeBlockRegex = /```(.*?)?\n([\s\S]+?)\n```/gm;
	let match;

	while ((match = codeBlockRegex.exec(text)) !== null) {
		const body = match[2];
		const otherParts = match[1];

		const snippet = snippetFromParts(body, editor.options.tabSize as number, otherParts);
		const snippetName = snippet.name || uniqueId();
		snippets[snippetName] = snippet.snippet;
	}

	const snippetsFolderPath = getSnippetsFolderPath($state.context);
	const generatedPath = path.join(snippetsFolderPath, Constants.GlolalGeneratedSnippetFileName);

	await fs.promises.writeFile(generatedPath, `${Constants.GeneratedWarning}\n${JSON.stringify(snippets, undefined, Constants.TabSymbol)}`);
}, 1000, {
	leading: false,
});

interface SnippetType {
	body: string[] | string;
	prefix?: string[] | string;
	description?: string[] | string;
	scope?: string;
}

function snippetFromParts(body: string, indentSize = 4, otherParts = ''): { snippet: SnippetType; name?: string } {
	const [scopes, prefixes, name, description] = otherParts.split(' ');

	const snippetBody = body.split('\n')
		.map(line => {
			const lineIndentMatch = line.match(/^ +/);
			const lineIndentSize = lineIndentMatch?.[0]?.length || 0;
			if (lineIndentSize === 0) {
				return line;
			}
			const lineIndent = Math.floor(lineIndentSize / indentSize);
			line = line.replace(new RegExp(`^ {${lineIndent * indentSize}}`), '\t'.repeat(lineIndent));
			return line;
		});

	return {
		snippet: {
			prefix: useStringWhenPossible(prefixes && prefixes !== Constants.SkipSnippetPart ? prefixes.split(',') : undefined),
			scope: useStringWhenPossible(scopes && scopes !== Constants.SkipSnippetPart ? scopes : undefined),
			body: useStringWhenPossible(snippetBody),
			description: description && description !== Constants.SkipSnippetPart ? description : undefined,
		},
		name: name && name !== Constants.SkipSnippetPart ? name : undefined,
	};
}

function useStringWhenPossible<T>(item: T): T {
	if (Array.isArray(item) && item.length === 1) {
		return item[0];
	}
	return item;
}

function uniqueId() {
	return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
