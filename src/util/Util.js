"use-strict";

const webp = require("node-webpmux");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const Crypto = require("crypto");
const { tmpdir } = require("os");
const path = require("path");

const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

class Util {
    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instianted`);
    }

    static generateHash(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    /**
     * Sets default properties on an object that aren't already specified.
     * @param {Object} def Default properties
     * @param {Object} given Object to assign defaults to
     * @returns {Object}
     */
    static mergeDefault(def, given) {
        if (!given) return def;
        for (const key in def) {
            if (!has(given, key) || given[key] === undefined) {
                given[key] = def[key];
            } else if (given[key] === Object(given[key])) {
                given[key] = Util.mergeDefault(def[key], given[key]);
            }
        }

        return given;
    }

    /**
     * Format sticker
     *
     * @param {MessageMedia} media
     * @returns {Promise<MessageMedia>}
     */
    static async formatSticker(media) {
        if (!media) return
        if (media.mimetype.includes("webp")) return media;

        const tempFile = path.join(
            tmpdir(),
            `${Crypto.randomBytes(6).readUintLE(0, 6).toString(36)}.webp`
        );

        const stream = new (require("stream").Readable)();
        const buffer = Buffer.from(
            media.data.replace(`data:${media.mimetype};base64,`, ""),
            "base64"
        );

        stream.push(buffer);
        stream.push(null);

        await new Promise((resolve, reject) => {
            ffmpeg(stream)
            .on("error", reject)
            .on("end", () => resolve(true))
            .addOutputOptions([
                `-vcodec`,
                `libwebp`,
                `-vf`,
                `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse
            `])
            .toFormat("webp")
            .save(tempFile)
        });

        const data = fs.readFileSync(tempFile, "base64");
        fs.unlinkSync(tempFile);
        
        return {
            mimetype: "image/webp",
            data,
            filename: media.filename
        }
    }

    /**
     * Generate a sticker
     *
     * @param {MessageMedia} media
     * @param {StickerData} stickerData
     * @returns {MessageMedia}
     */
    static async generateSticker(media, stickerData) {
        let webpMedia;

        if (media.mimetype.includes("image") || media.mimetype.includes("video")) {
            webpMedia = await this.formatSticker(media);
        } else {
            throw new Error("Invalid media type");
        }

        if (stickerData.author || stickerData.name) {
            const img = new webp.Image();
            const json = {
                'sticker-pack-id': this.generateHash(8),
                'sticker-pack-name': stickerData.name,
                'sticker-pack-publisher': stickerData.author,
                'emojis': stickerData.categories || [""]
            };
            let exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
            let jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
            let exif = Buffer.concat([exifAttr, jsonBuffer]);
            exif.writeUIntLE(jsonBuffer.length, 14, 4);
            await img.load(Buffer.from(webpMedia.data, 'base64'));
            img.exif = exif;
            webpMedia.data = (await img.save(null)).toString('base64');
        }

        return webpMedia
    }
}

module.exports = Util
