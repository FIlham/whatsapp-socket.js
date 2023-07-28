"use-strict";

const Base = require("./Base");

class Group extends Base {
    constructor(client, groupMetadata) {
        super(client);
        if (groupMetadata) this._patch(groupMetadata);
    }

    _patch(groupMetadata) {
        /**
         * Unique ID of group
         * @type {string}
         */
        this.id = groupMetadata.id;

        /**
         * Owner of group
         * @type {string}
         */
        this.owner = groupMetadata.owner;

        /** 
         * Subject/name of group
         * @type {string}
         */
        this.subject = groupMetadata.subject;

        /**
         * Description of group
         * @type {string}
         */
        this.description = groupMetadata.description;

        /**
         * When this group has been created?
         * @type {number}
         */
        this.createdAt = groupMetadata.creation;

        /**
         * Participants of group
         * @type {Participant}
         */
        this.participants = [];

        for (const participant of groupMetadata.participants) {
            this.participants.push({
                jid: participant.id,
                isAdmin: participant.admin ? true : false,
                isOwnerGroup: participant.admin == "superadmin"
            })
        }

        /**
         * When the subject has been modificated?
         * @type {number}
         */
        this.subjectModAt = groupMetadata.subjectTime;

        /**
         * is set when the group only allows admins to change group settings
         * @type {boolean}
         */
        this.restrict = groupMetadata.restrict;

        /** 
         * is set when the group only allows admins to write messages
         * @type {boolean}
         */
        this.announce = groupMetadata.announce;

        /**
         * Ephemeral duration
         * @type {number}
         */
        this.ephemeralDuration = groupMetadata.ephemeralDuration;

        /**
         * Group invite code
         * @type {string}
         */
        this.inviteCode = groupMetadata.inviteCode;

        /**
         * Who added you?
         * @type {string}
         */
        this.whoAddYou = groupMetadata.author;

        return super._patch(groupMetadata);
    }

    /**
     * Update participants on group (add, remove, promote, demote)
     *
     * @param {string} groupId Unique ID of group
     * @param {string[]} participants Participants who for add to group
     * @param {"add"|"remove"|"promote"|"demote"} action Action for change
     */
    async changeGroupParticipants(groupId, participants, action) {
        return participants.forEach(async (participant) => {
            await this.client.sock.groupParticipantsUpdate(
                groupId,
                [participant],
                action
            );
        })
    }

    /**
     * Update group (subject, description)
     *
     * @param {string} groupId Unique ID of group
     * @param {string} content Content to update a group
     * @param {"subject", "description"} action
     */
    async updateGroup(groupId, content, action) {
        if (action == "subject") {
            return await this.client.sock.groupUpdateSubject(groupId, content);
        } else if (action == "description") {
            return await this.client.sock.groupUpdateDescription(groupId, content);
        }
    }
}

module.exports = Group;
