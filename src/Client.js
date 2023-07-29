"use-strict";

const EventEmitter = require("events");
const { default: makeWASocket, proto, useMultiFileAuthState, DisconnectReason, URL_REGEX, makeInMemoryStore } = require("@whiskeysockets/baileys");
const { pino } = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const Util = require("./util/Util");
const { DefaultOptions, Events } = require("./util/Constants");
const { MessageMedia, Group, Message, GroupNotification, Location } = require("./structure/");

const parseMention = (text = "") => { return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net'); }

/**
 * Client Class
 *
 * @extends {EventEmitter}
 * @param {object} options - Client options
 * @param {string} options.sessionName - Session name of client
 * @param {boolean} options.self - If true, the bot can reply their message
 * @param {number} options.intervalStore - Interval that set of store when the message is stored. Default 10s
 *
 * @fires Client#qr
 * @fires Client#connecting
 * @fires Client#ready
 * @fires Client#disconnect
 * @fires Client#message
 * @fires Client#group_participants_update
 */
class Client extends EventEmitter {
    constructor(options = {}) {
        super();

        this.options = Util.mergeDefault(DefaultOptions, options);

        this.sock = null;

        // implement the store
        this.store = makeInMemoryStore({ logger: pino({ level: "silent" }) });
        this.store.readFromFile(`./${this.options.sessionName}.json`);
        setInterval(() => {
            this.store.writeToFile(`./${this.options.sessionName}.json`);
        }, this.options.intervalStore || 10_000);
    }

    /**
     * Initialize client set up
     */
    async initialize() {
        try {
            const { state, saveCreds } = await useMultiFileAuthState(this.options.sessionName);
            const sock = makeWASocket({
                auth: state,
                logger: pino({ level: "silent" })
            })
            this.sock = sock;
            this.store.bind(sock.ev);

            sock.ev.on("connection.update", (update) => {
                if (update.qr) {
                    /**
                     * Emitted when qr ready to scan
                     * @event Client#qr
                     * @param {string}
                     */
                    this.emit("qr", update.qr);
                }

                if (update.connection == "close") {
                    const statusCode = new Boom(update.lastDisconnect?.error)?.output.statusCode;
                    if (statusCode === DisconnectReason.loggedOut || statusCode === DisconnectReason.badSession || statusCode === DisconnectReason.connectionReplaced) {
                        /**
                         * Emitted when socket is closed/disconnect from whatsapp server
                         * @event Client#disconnect
                         */
                        this.emit("disconnect", "Connection should be disconnect");
                    } else {
                        /**
                         * Emitted when socket is connecting/reconnecting to whatsapp server
                         */
                        this.emit("connecting", "Connection keep connecting to server");
                        this.initialize();
                    }
                } else if (update.connection == "connecting") this.emit("connecting", "connecting to socket");
                else if (update.connection == "open") this.emit("ready", "connection has ready");
            })

            sock.ev.on("messages.upsert", ({ messages }) => {
                const message = new Message(this, messages[0]);
                if (!messages[0] || !messages[0].message) return;
                if (!this.options.self && message.id.fromMe) return; // if self it false
                /**
                 * Emitted when receive a message
                 * @event Client#message
                 * @param {Message}
                 */
                this.emit("message", message);
            })

            sock.ev.on("group-participants.update", (update) => {
                const groupUpdate = new GroupNotification(this, update);
                /**
                 * Emitted when group participants updated
                 * @event Client#group_participants_update
                 * @param {GroupNotification}
                 */
                this.emit("group_participants_update", groupUpdate);
            })

            sock.ev.on("creds.update", saveCreds)
        } catch (error) {
            throw error
        }
    }

    /**
     * @typedef {Object} MessageOptions
     * @property {string} [quotedMsgId] - To get replied/quoted message
     * @property {boolean} [parseMention=false] - To parse the mention
     * @property {Array<string>} [mentions] - To send message with mentions
     * @property {string} [mimetype] - If the content is MessageMedia, it will be recommended
     * @property {string} [caption] - If the content is MessageMedia, it will be recommended
     * @property {Object} [sticker] - Sticker metadata (if it set, the media will be sent as sticker)
     * @property {object} [extra] - Extra options
     */

    /**
     * Send message to user with specific jid, content, and some options
     *
     * @param {string} jid - Jid of the user who this content message to be sent
     * @param {string|MessageMedia} content - The content of message
     * @param {MessageOptions} options
     * @returns {Promise<Message>}
     */
    async sendMessage(jid, content, options = {}) {
        if (content instanceof MessageMedia) {
            const contentType = content.mimetype.split("/")[0];
            if (options.sticker) {
                const stickerBuff = await Util.generateSticker(content, options.sticker);
                content = {
                    sticker: Buffer.from(stickerBuff.data, "base64"),
                }
            } else {
                content = {
                    [contentType]: Buffer.from(content.data, "base64"),
                    ...options
                }
            }
        } else if (typeof content == "string") {
            content = {
                text: content
            }
        } else if (content instanceof Location) {
            content = {
                location: {
                    degreesLatitude: content.latitude,
                    degreesLongitude: content.longitude,
                    name: content.description
                }
            }
        }
        
        if (options.parseMention) content.mentions = parseMention(content?.text || content?.caption || ""); // parse mentions
        if (options.quotedMsgId) options.quoted = await this.store.loadMessage(jid, options.quotedMsgId);
        let internalOptions = {
            mimetype: options.mimetype,
            ...options.extra
        }

        const msg = await this.sock.sendMessage(jid, content, { ...internalOptions, ...options });
        return new Message(this, msg);
    }

    /**
     * Get content message by jid and unique id
     *
     * @param {string} jid - Jid of message author
     * @param {string} id - Unique id
     * @returns {Promise<Message>}
     */
    async getMessageContent(jid, id) {
        const messageContent = await this.store.loadMessage(jid, id);
        return new Message(this, messageContent);
    }

    /**
     * Get group metadata
     *
     * @param {string} groupId - Unique ID of group
     * @returns {GroupMetadata}
     */
    async getGroupMetadata(groupId) {
        const groupData = await this.sock.groupMetadata(groupId);
        return new Group(this, groupData);
    }

    /**
     * Destroy a client socket connection
     */
    destroy() {
        fs.unlinkSync(`./${this.options.sessionName}`);
        fs.unlinkSync(`./${this.options.sessionName}.json`);
        this.sock.end();
        return;
    }
}

module.exports = Client
