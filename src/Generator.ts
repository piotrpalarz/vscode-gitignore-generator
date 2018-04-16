import * as path from "path";
import { window, workspace } from "vscode";
import { API_URL, FILE_NAME, MESSAGES } from "./modules/config";
import {
    getFolderOption,
    getItemsOption,
    getOverrideOption,
    openFile,
    openUntitledFile,
} from "./modules/ui";
import { fileExists, hasFolder, writeFile } from "./modules/filesystem";
import { getData } from "./modules/http";
import { generateFile, getList } from "./modules/helpers";

export default class Generator {
    private folders = workspace.workspaceFolders;
    private filePath: string | null = null;
    private override: boolean = true;
    private selected: string[];

    public async init() {
        this.filePath = await this.getFilePath();

        if (this.filePath) {
            this.override = await this.getOverrideOption();
        }

        this.selected = await this.getSelectedOptions();
        this.generate();
    }

    private async get(fn, ...args) {
        const result = await fn.apply(this, args);

        if (result === undefined) {
            this.abort();
        }

        return result;
    }

    private async getFilePath() {
        if (!hasFolder(this.folders)) {
            return null;
        }

        const folderName =
            this.folders.length > 1
                ? await this.get(getFolderOption, this.folders)
                : this.folders[0].name;

        const folderPath = this.folders.find(
            folder => folder.name === folderName
        ).uri.fsPath;

        return path.join(folderPath, FILE_NAME);
    }

    private async getOverrideOption() {
        return fileExists(this.filePath)
            ? await this.get(getOverrideOption)
            : true;
    }

    private async getSelectedOptions() {
        let message = window.setStatusBarMessage(MESSAGES.fetching);

        const list = await getList(this.filePath, !this.override);

        message.dispose();

        if (list === null) {
            return window.showErrorMessage(MESSAGES.network_error);
        }

        return await this.get(getItemsOption, list);
    }

    private async generate() {
        const message = window.setStatusBarMessage(MESSAGES.generating);

        const data = await getData(`${API_URL}/${this.selected.join(",")}`);

        if (data === null) {
            return window.showErrorMessage(MESSAGES.network_error);
        }

        const output = generateFile(this.filePath, data, this.override);

        if (this.filePath) {
            const result = writeFile(this.filePath, output);

            if (result === false) {
                message.dispose();
                window.showErrorMessage(MESSAGES.save_error);
                this.abort();
            }

            openFile(this.filePath);
        } else {
            openUntitledFile(output);
        }

        message.dispose();

        window.setStatusBarMessage(
            MESSAGES.generated.replace(
                "[action]",
                this.override ? "created" : "updated"
            ),
            3000
        );
    }

    private abort() {
        throw new Error("Extension action aborted");
    }
}
