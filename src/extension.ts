import * as vscode from "vscode";
import { Hover, languages, MarkdownString } from "vscode";
const removeMd = require("remove-markdown");

export function activate(context: vscode.ExtensionContext) {
  type ExpandRecursively<T> = T extends object
    ? T extends infer O
      ? { [K in keyof O]: ExpandRecursively<O[K]> }
      : never
    : T;

  // type ExpandedText = ExpandRecursively<T>;

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json

  let disposable = languages.registerHoverProvider(
    ["typescript", "typescriptreact"],
    {
      provideHover,
    }
  );

  context.subscriptions.push(disposable);
}

async function provideHover(
  document: vscode.TextDocument,
  position: vscode.Position,
  token: vscode.CancellationToken
) {
  const word = await getPlainText(position);

  if (!word) {
    return;
  }

  return new Hover({
    language: "typescript",
    value: word,
  });
}

async function getPlainText(
  position: vscode.Position
): Promise<string | undefined> {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    return;
  }
  const selection = activeEditor.document.getWordRangeAtPosition(position);
  if (!selection) {
    return;
  }

  const hovers = await vscode.commands.executeCommand<Hover[]>(
    "vscode.executeHoverProvider",
    activeEditor.document.uri,
    activeEditor.selection.active
  );

  const parts = hovers
    ?.flatMap((hover) => hover.contents)
    .map((content) => getMarkdownValue(content as MarkdownString))
    .filter((content) => content.length > 0);

  if (!parts?.length) {
    return;
  }

  const markdown = parts.join("\n---\n");
  return removeMarkdown(markdown);
}

function removeMarkdown(markdown: string) {
  const targetLanguageRegExp = new RegExp(/```(type|java)script/);
  if (targetLanguageRegExp.test(markdown)) {
    return markdown.replace(targetLanguageRegExp, "").replace(/```/, "");
  }
  return removeMd(markdown);
}

function getMarkdownValue(content: MarkdownString): string {
  return content.value;
}

// This method is called when your extension is deactivated
export function deactivate() {}

