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
      provideHover(document, position, token) {
        const range = document.getWordRangeAtPosition(position);
        const word = document.getText(range);

        return new Hover({
          language: "typescript",
          value: word,
        });
      },
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

