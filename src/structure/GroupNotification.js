"use-strict";

const Base = require("./Base.js");

class GroupNotification extends Base {
    constructor(client, data) {
        super(client);
        if (data) this._patch(data);
    }

    _patch(data) {
        /**
         * Group unique id
         * @type {string}
         */
        this.groupId = data.id;

        /**
         * Participants that updated
         *@type {string[]}
         */
        this.participants = data.participants;

        /**
         * Type of notification
         * @type {ChangeParticipantsAction}
         */
        this.type = data.action;

        return super._patch(data);
    }

    /**
     * Send message to participants in this group notification class
     *
     * @param {MessageContent} content
     * @param {object} options
     * @returns {Promise<Message>}
     */
    async reply(content, options = {}) {
        return this.participants.forEach(async (participant) => {
            await this.client.sendMessage(participant, content, options);
        })
    }
}

module.exports = GroupNotification;
