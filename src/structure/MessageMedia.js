"use-strict";

const fs = require("fs");
const mime = require("mime");
const path = require("path");
const { URL } = require("url");
const fetch = require("node-fetch");

/**
 * Media attached to message
 *
 * @param {string} mimetype Mimetype of media
 * @param {string} data Data of media (Base64-Encoded)
 * @param {?string} filename Name of media [optional]
 * @param {?number} filesize Size of media [optional]
 */
class MessageMedia {
    constructor(mimetype, data, filename, filesize) {
        /**
         * Mimetype of media
         * @type {string}
         */
        this.mimetype = mimetype;

        /*
         * Data of media (Base64-Encoded)
         * @type {string}
         */
        this.data = data;

        /**
         * Name of media [optional]
         * @type {?string}
         */
        this.filename = filename;

        /**
         * Size of media
         * @type {?number}
         */
        this.filesize = filesize;
    }

    /**
     * Attach media by file path
     *
     * @param {string} filePath
     * @returns {MessageMedia}
     */
    static fromFilePath(filePath) {
        const buffData = fs.readFileSync(filePath, { encoding: "base64" });
        const mimetype = mime.getType(filePath);
        const filename = path.basename(filePath);

        return new MessageMedia(mimetype, buffData, filename);
    }

    /**
     * Attach media by url
     *
     * @param {string} url
     * @param {string} filename
     * @returns {MessageMedia}
     */
    static async fromUrl(url, filename) {
        const pUrl = new URL(url);
        let mimetype = mime.getType(pUrl.pathname);

        const reqOptions = Object.assign({ headers: { accept: "image/* video/* text/* audio/*" } });
        const response = await fetch(url, reqOptions);
        const mimeType = response.headers.get("Content-Type");
        const size = response.headers.get("Content-Length");

        const contentDisposition = response.headers.get("Content-Disposition");
        const name = contentDisposition?.match(/((?<=filename=")(.*)(?="))/);

        let data = "";
        if (response.buffer) {
            data = (await response.buffer()).toString("base64");
        } else {
            const bArray = new Uint8Array(await response.arrayBuffer());
            bArray.forEach((b) => {
                data += String.fromCharCode(b);
            })
            data = btoa(data);
        }

        const res = { mimeType, data, name, size };
        const fileName = filename || ((res.name ? res.name[0] : null) || (pUrl.pathname.split("/").pop() || "file"));
        if (!mimetype) mimetype = res.mimeType;

        return new MessageMedia(mimetype, res.data, fileName, res.size);
    }
}

module.exports = MessageMedia;
