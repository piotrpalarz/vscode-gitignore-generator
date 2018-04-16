import * as vscode from "vscode";
import { window, workspace, QuickPickItem } from "vscode";
import { FILE_NAME, OVERRIDE_OPTIONS, PLACEHOLDERS } from "./config";

export function getFolderOption(folders) {
    const options = folders.map(folder => folder.name);

    return window.showQuickPick(options, {
        placeHolder: PLACEHOLDERS.location,
    });
}

export function getOverrideOption() {
    return window
        .showQuickPick(OVERRIDE_OPTIONS, {
            placeHolder: PLACEHOLDERS.override,
        })
        .then(option => {
            if (option === undefined) {
                return undefined;
            }

            return option === OVERRIDE_OPTIONS[0] ? true : false;
        });
}

export function getItemsOption(items: QuickPickItem[]) {
    return window
        .showQuickPick(items, {
            canPickMany: true,
            placeHolder: PLACEHOLDERS.selection_hint,
        })
        .then(selected => {
            if (selected === undefined || selected.length === 0) {
                return undefined;
            }

            return selected.map(item => item.label);
        });
}

export function openFile(filePath: string) {
    vscode.commands.executeCommand("vscode.open", vscode.Uri.file(filePath));
}

export function openUntitledFile(content: string) {
    workspace.openTextDocument({ content }).then(doc => {
        window.showTextDocument(doc);
    });
}
