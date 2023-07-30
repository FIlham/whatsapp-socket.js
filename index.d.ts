import { EventEmitter } from "events";

declare namespace WaSocketJS {
    
    export class Client extends EventEmitter {
        constructor(options: ClientOptions);

        /** Socket integration of baileys */
        sock?: any;

        /** Store integration of baileys */
        store?: any;

        /** Indicates state of socket connection */
        state?: ConnectionState;

        /** connection accidentally closed? */
        isClosed?: boolean;

        /** Initialize client set up */
        initialize(): Promise<void>;

        /** Send message to user with specific jid, content, and some options */
        sendMessage(jid: string, content: MessageContent, options?: MessageOptions): Promise<Message>;

        /** Get message content by jid and unique id */
        getMessagContent(jid: string, id: string): Promise<Message>;

        /** Get group metadata */
        getGroupMetadata(groupId: string): Promise<GroupMetadata>;

        /** Destroy a socket client connection */
        destroy(deleteSession: boolean): void;

        /** Close connection of socket */
        close(): void;

        /** Emitted when qr is ready to scan */
        on(event: "qr", listener: (qr: string) => void): this;

        /** Emitted when socket is connecting/reconnecting to whatsapp server */
        on(event: "connecting", listener: (message: string) => void): this;

        /** Emitted when socket is connect to whatsapp server and connection is ready  */
        on(event: "ready", listener: (message: string) => void): this;

        /** Emitted when socket is closed/disconnect from whatsapp server */
        on(event: "disconnect", listener: (message: string) => void): this;

        /** Emitted when received message */
        on(event: "message", listener: (
            /** Message is received */
            message: Message
        ) => void): this;

        /** Emitted when group participants has updated */
        on(event: "group_participants_update", listener: (
            /** Metadata of group participants update */
            update: GroupParticipantsUpdate
        ) => void): this;
    }

    /** Client options */
    export interface ClientOptions {
        /** Session name of client */
        sessionName: string;
        /** If true, the bot can reply their message */
        self: boolean;
        /** Interval that set of store when the message is stored. Default 10s */
        intervalStore: number;
    }

    /** Type of message content that available on this library */
    export type MessageContent = string | MessageMedia;

    /** Message send options */
    export interface MessageOptions {
        /** If true, all the text/caption of message will be parsed to get the mentions text */
        parseMention?: boolean;
        /** Send message with mentions with specific jid */
        mentions?: string[];
        /** If you want to send message with replied/quoted, fill this option with message id */
        quotedMsgId?: string;
        /** If the content is MessageMedia, it would be recommended */
        mimetype?: Mimetype;
        /** If the content is MessageMedia, it would be recommended */
        caption?: string;
        /** Sticker metadata (if it set, the media will be sent as sticker) */
        sticker?: StickerData;
        /** Extra options */
        extra?: any;
    }

    /** Implementing of received message */
    export interface Message {
        /** ID that represent of sender */
        id: MessageID;
        /** JID that represent who sent the message*/
        sender: string;
        /** JID that represent where the message is come */
        from: string;
        /** Message content */
        body: string;
        /** When this message has sent */
        timestamp: number;
        /** Type of message */
        type: string;
        /** Indicates if message is replied/quoted */
        hasQuotedMsg: boolean;
        /** Indicates if message is from group */
        isGroupMsg: boolean;
        /** Nickanme of whatsapp sender */
        pushname: string;
        /** If the message contain mentioned user */
        mentionedJids: string[];
        /** Send replied message */
        reply(content: MessageContent, options: MessageOptions): Promise<Message>;
        /** Download media message */
        downloadMediaMessage(): Promise<MessageMedia>;
        /** Get message quoted */
        getMessageQuoted(): Promise<Message>;
    }

    /** Implementing the MessageMedia class */
   export class MessageMedia {
        /** Mimetype of media */
        mimetype: string;
        /** Data of media (Base64-Encoded) */
        data: string;
        /** Filename of media [optional] */
        filename?: string;
        /** Filesize of media [optional] */
        filesize?: number

         /**
         * @param {string} mimetype Mimetype of media
         * @param {string} data Data of media (Base64-Encoded)
         * @param {?string} filename Name of media [optional]
         * @param {?number} filesize Size of media [optional]
         */
        constructor(
            mimetype: string,
            data: string,
            filename?: string,
            filesize?: number
        )

        /** Attach media by file path */
        static fromFilePath(filePath: string): MessageMedia;

        /** Attach media by url */
        static fromUrl(url: string, filename: string): Promise<MessageMedia>;
    }

    /** Represent the ID of sender */
    export interface MessageID {
        /** If it from group, this will be contain the user who sent it message */
        participant?: string;
        /** Indicates where the message is sent it */
        remoteJid: string;
        /** Indicates the message is sent by current user/bot */
        fromMe: boolean;
        /** Unique ID that represent the message id */
        id: string;
    }

    /** Sticker metadata */
    export interface StickerData {
        /** Author of sticker */
        author?: string;
        /** Name of sticker */
        name?: string;
        /** Caregories of sticker */
        categories?: string[];
    }

    /** Group metadata */
    export interface GroupMetadata {
        /** Unique ID of group */
        id: string;
        /** Owner of group */
        owner?: string;
        /** Subject/name of group */
        subject: string;
        /** Description of group */
        description: string;
        /** When this group has been created? */
        createdAt: number;
        /** Participants of group */
        participants: Participant[];
        /** When the subject has been modificated? */
        subjectModifAt?: number;
        /** is set when the group only allows admins to change group settings */
        restrict?: boolean;
        /** is set when the group only allows admins to write messages */
        announce?: boolean;
        /** Ephemeral duration */
        ephemeralDuration?: number;
        /** Group invite code */
        inviteCode?: string;
        /** Who added you? */
        whoAddYou?: string;
        /** Change participants on group (add, remove, promote, demote) */
        changeGroupParticipants(groupId: string, participants: string[], action: ChangeParticipantsAction): Promise<any>;
        /** Update group (subject, description) */
        updateGroup(groupId: string, content: string, action: UpdateGroupAction): Promise<any>;
    }

    /** Participant model of group */
    export interface Participant {
        /** JID of user */
        jid: string;
        /** Indicates is the admin? */
        isAdmin: boolean;
        /** Indicates is the owner group/super admin? */
        isOwnerGroup?: boolean;
    }

    export type ChangeParticipantsAction = "add" | "remove" | "promote" | "demote";
    export type UpdateGroupAction = "subject" | "description";

    /** Group participants update (add, remove, promote, demote) */
    export interface GroupParticipantsUpdate {
        /** Group unique id */ 
        groupId: string;
        /** Participants that updated */
        participants: string[];
        /** Type of notification */
        type: ChangeParticipantsAction;
        /** Send message to participant in this group notification class */
        reply(content: MessageContent, options: MessageOptions): Promise<Message>;
    }

    /** Location class */
    export class Location {
        /** Latitude of location */
        latitude: number;
        /** Longitude of location */
        longitude: number;
        /** Description of location */
        description?: string;

        constructor(latitude: string, longitude: string, description?: string)
    }

    export type ConnectionState = "ready" | "close" | "connecting";
}

export = WaSocketJS;
