import * as http from "https";
import { parse as parseUrl } from "url";

export function httpGet(url: string) {
    const { protocol, hostname, path } = parseUrl(url);

    return new Promise((resolve, reject) => {
        let data = "";

        http
            .get({ protocol, hostname, path }, res => {
                res.on("data", chunk => (data += chunk));
                res.on("end", () => resolve(data));
                res.on("close", () => reject());
            })
            .on("error", () => reject());
    });
}

export async function getData(url: string) {
    try {
        return Promise.resolve(await httpGet(url));
    } catch (e) {
        return Promise.resolve(null);
    }
}
