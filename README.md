
# WASocketJS

An unofficial WhatsApp API using [baileys](https://github.com/whiskeysockets/baileys)  implemented into [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js).

You can use all the features here like you use whatsapp-web.js with the help of the main library, baileys.

# PLEASE NOTE

I cannot guarantee that you can always use this library safely because the threat from WhatsApp to users who use unofficial WhatsApp API services is the possibility of an account ban/blocking for those who engage in such actions, and this ban can be for a significant period. So, use this at your own risk.

# Get started
To get started, first, you need to install this library using npm/yarn/pnpm.

NPM
```
npm install whatsapp-socket.js
```
Yarn
```
yarn add whatsapp-socket.js
```
PNPM
```
pnpm install whatsapp-socket.js
```
If you have installed the library, you can create a JavaScript file and fill it with the following code.
```js
const { Client } = require("whatsapp-socket.js");

const client = new Client({ sessionName: "wsocketjs" });
client.initialize();
client.on("qr", (qr) => {
    console.log("QR RECEIVED " + qr)
});
client.on("ready", (msg) => console.log(msg));
client.on("message", (msg) => {
    if (msg.body == "#ping") {
        msg.reply("pong!");
    }
});
```
A brief explanation: You need to import the client class from the library and initialize it with the available variable (``const client = new Client()``). After that, use events to obtain some data from the WhatsApp server connection.

# Options

There are several options available in this library.
```ts
/** Client options */
interface ClientOptions {
    /** Session name of client */
    sessionName: string;
    /** If true, the bot can reply their message */
    self: boolean;
    /** Interval that set of store when the message is stored. Default 10s */
    intervalStore: number;
}

/** Message send options */
interface MessageOptions {
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
```
For more details, you can refer to index.d.ts.

_i need more time to create this documentation (⁠╥⁠﹏⁠╥⁠)_
_you can open issues if there is any problem/solution_
_the 'alternative documentation' availabel in [example.js](https://github.com/FIlham/whatsapp-socket.js/blob/main/example.js)_
