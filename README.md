Use markdown file and Fenced Code Blocks to store all snippets. Example:

````
```javascript,typescript prefix1,prefix2 name description
console.log($0);
```
````

![demo_of_markdown_file](./img/demo.png)

Use spaces for indentation in the `snippets.md` file (not tabs).

Snippet parts can be omitted by using underscore sign `_`.

There is autocomplete for variables such as `TM_SELECTED_TEXT`, but it doesn't auto show inside the code block (need to trigger suggest `editor.action.triggerSuggest` <kbd>Ctrl</kbd>+<kbd>Space</kbd>).


<!-- COMMANDS_START -->
## Commands (1)

|Command|Description|
|-|-|
|snippetsInMarkdown.openSnippetsFile|Snippets In Markdown: Open Global Snippets File|
<!-- COMMANDS_END -->