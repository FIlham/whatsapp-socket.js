"use-strict";

const { getContentType, downloadContentFromMessage, toBuffer, isJidGroup } = require("@whiskeysockets/baileys");
const Base = require("./Base.js");
const MessageMedia = require("./MessageMedia.js");

/**
 * Message class
 */
class Message extends Base {
    constructor(client, data) {
        super(client);
        if (data && data.message) this._patch(data);
    }

    _patch(data) {
        this._data = data;

        /**
         * Object that represent ID of sender
         * @type {object}
         */
        this.id = data.key;

        /**
         * Message type
         * @type {string}
         */
        this.type = getContentType(data.message);

        /**
         * Message body/caption
         * @type {string}
         */
        this.body = data.message.conversation || data.message[this.type].caption || data.message[this.type].text || "";

        /**
         * Time when message sent
         * @type {number}
         */
        this.timestamp = data.messageTimestamp;

        /**
         * If the message contain mentioned user
         * @type {Array<string>}
         */
        this.mentionedJids = [];

        if (data.mentionedJidList) this.mentionedJids = data.mentionedJidList;

        /**
         * Indicates if message is replied for another message
         * @type {boolean}
         */
        this.hasQuotedMsg = data.message?.extendedTextMessage?.contextInfo?.hasOwnProperty("quotedMessage");

        /**
         * The pushname/nickname whatsapp of sender
         * @type {string}
         */
        this.pushname = data.pushName;

        /**
         * The jid of sender
         * @type {string}
         */
        this.sender = this.id.participant || this.id.remoteJid;
        
        /**
         * Jid from who sent the message
         * @type {string}
         */
        this.from = this.id.remoteJid;

        /**
         * The jid is group?
         * @type {boolean}
         */
        this.isGroupMsg = isJidGroup(this.from);

        return super._patch(data);
    }

    /**
     * Send replied message
     *
     * @param {string|MessageMedia} content - The content to sent
     * @param {MessageOptions} options
     * @returns {Promise<Message>}
     */
    async reply(content, options = {}) {
        return await this.client.sendMessage(this.id.remoteJid, content, { ...options, quoted: this._data });
    }

    /**
     * Download media message
     *
     * @returns {Promise<MessageMedia>}
     */
    async downloadMediaMessage() {
        const mediaType = this.type.replace("Message", "");
        const mimeType = this._data.message[this.type].mimetype;
        const media = await downloadContentFromMessage(this._data.message[this.type], mediaType);
        return new MessageMedia(
            mimeType,
            (await toBuffer(media)).toString("base64"),
            `${Date.now()}.${mimeType.split("/")[1]}`
        )
    }

    /**
     * Get message quoted
     *
     * @returns {Promise<Message>}
     */
    async getMessageQuoted() {
        if (this.hasQuotedMsg) {
            const messageQuotedId = this._data.message[this.type].contextInfo;
            const messageQuoted = await this.client.getMessageContent(messageQuotedId.participant, messageQuotedId.stanzaId);
            return messageQuoted;
        }
    }
}

module.exports = Message;
