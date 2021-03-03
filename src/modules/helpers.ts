import * as os from "os";
import { readFile } from "./filesystem";
import { getData } from "./http";
import { API_URL, ALTERNATIVE_API_URL, BANNER, USER_RULES } from "./config";

export function hitAntiDdos(value: string | null) {
    if(value === null) {
        return false;
    }

    return (/^<!DOCTYPE.*>/gi).test(value.trim());
}

export async function getList(path: string | null, keepCurrent: boolean) {
    let data = await getData(`${API_URL}/list`);

    if(hitAntiDdos(data)) {
        data = await getData(`${ALTERNATIVE_API_URL}/list`);
    }

    if (data === null) {
        return null;
    }

    const selectedItems = getSelectedItems(path, keepCurrent);

    const items = data.split(/[,\n\r]+/).map(item => ({
        label: item,
        picked: selectedItems.indexOf(item) !== -1,
    }));

    items.pop();

    items.sort((a, b) => {
        if (a.picked) {
            return -1;
        } else if (b.picked) {
            return 1;
        }

        return 0;
    });

    return items;
}

export function getOs() {
    const systems = {
        darwin: "macos",
        linux: "linux",
        win32: "windows",
    };

    const system = systems[os.platform()];

    return system ? system : null;
}

export function getCurrentItems(path: string) {
    const file = readFile(path);

    if (file === null) {
        return [];
    }

    const regex = /^# Created by.+\/(.+)$/m;
    const result = regex.exec(file);

    return result && result[1] ? result[1].split(",") : [];
}

export function getUserRules(filePath) {
    const file = readFile(filePath);

    if (file === null) {
        return null;
    }

    const result = file.split(USER_RULES)[1];

    console.log(result);

    return result ? result.trim() : null;
}

export function getSelectedItems(
    filePath: string | null,
    keepCurrent: boolean
) {
    const selected = [];

    if (!keepCurrent) {
        selected.push("visualstudiocode", getOs());
    }

    if (keepCurrent && filePath) {
        selected.push(...getCurrentItems(filePath));
    }

    return selected.filter(item => !!item);
}

export function generateFile(path: string, output: string, override: boolean) {
    output = `# ${BANNER}\n${output}\n# ${USER_RULES}\n`;

    if (!override) {
        const userRules = getUserRules(path);
        output += userRules ? `\n${userRules}` : "";
    }

    return `${output}\n`;
}
