"use strict";

import * as vscode from "vscode";
import Generator from "./Generator";

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand(
        "extension.gitignoreGenerate",
        () => {
            try {
                const generator = new Generator();

                generator.init();
            } catch (e) {
                console.log(e.message);
            }
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
