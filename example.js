"use-strict";

const { Client, MessageMedia, Location } = require("./index");

const client = new Client({ sessionName: "baileys_session", self: true });

client.initialize();

client.on("qr", (qr) => console.log(qr));
client.on("connecting", (msg) => console.log(msg));
client.on("disconnect", (msg) => {
    console.log(msg)
    client.destroy(true);
    process.exit(1);
});
client.on("ready", (msg) => console.log(msg));
client.on("message", async (msg) => {
    // if (!msg || !msg.id.fromMe) return;
    const groupInfo = msg.isGroupMsg ? await client.getGroupMetadata(msg.from) : null;
    console.log(msg);
    if (msg.body == "#ping") {
        return msg.reply(`pong! @${msg.sender.split("@")[0]}`, { parseMention: true });
    } else if (msg.body == "#image") {
        const media = await MessageMedia.fromUrl("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH8GWuMpRA101NQjhhM0hY6XNOnoIfUeAPfA&usqp=CAU");
        return msg.reply(media, { caption: "this is image!", sticker: { name: "asu", author: "kirek" } });
    } else if (msg.body == "#video") {
        const media = await MessageMedia.fromFilePath("./video.mp4");
        return msg.reply(media, { sticker: { name: "initokyolagii", author: "demon" } });
    } else if (msg.body == "#download") {
        const media = await msg.downloadMediaMessage();
        return msg.reply(media, { caption: "this is" });
    } else if (msg.body.startsWith("#sticker")) {
        let sticker = {};
        const stickerData = msg.body.split(" ").slice(1).join(" ")?.split("|") || [];
        if (stickerData.length > 0) {
            sticker.name = stickerData[0];
            sticker.author = stickerData[1];
        }
        const media = msg.hasQuotedMsg ? await (await msg.getMessageQuoted()).downloadMediaMessage() : await msg.downloadMediaMessage();
        return msg.reply(media, { sticker });
    } else if (msg.body == "#getQuoted") {
        const message = await msg.getMessageQuoted();
        return msg.reply(message.body);
    } else if (msg.body == "#groupInfo") {
        let text = `*Subject:* ${groupInfo.subject}`;
        text += `\n*Owner:* @${groupInfo.owner?.split("@")[0] || "Unknown"}`;
        text += `\n*Description:*\n${groupInfo.description}`;
        return msg.reply(text, { parseMention: true });
    } else if (
        msg.body.startsWith("#add") ||
        msg.body.startsWith("#kick") ||
        msg.body.startsWith("#promote") ||
        msg.body.startsWith("#demote")
    ) {
        const isAdmin = groupInfo?.participants?.some((x) => x.jid == msg.sender && x.isAdmin);
        const participants = msg.body.split(" ").slice(1).map((x) => `${x}@s.whatsapp.net`);
        const command = msg.body.split(" ").shift().slice(1).toLowerCase();
        if (isAdmin) {
            return groupInfo.changeGroupParticipants(
                msg.from,
                participants,
                command == "kick" ? "remove" : command
            )
        }
    } else if (msg.body.startsWith("#subject") || msg.body.startsWith("#desc")) {
        const isAdmin = groupInfo?.participants?.some((x) => x.jid == msg.sender && x.isAdmin);
        const content = msg.body.split(" ").slice(1).join(" ");
        const command = msg.body.split(" ").shift().slice(1).toLowerCase();
        if (isAdmin) {
            return groupInfo.updateGroup(
                msg.from,
                content,
                command == "desc" ? "description" : command
            )
        }
    } else if (msg.body.startsWith("#location")) {
        const q = msg.body.split(" ").slice(1).join(" ");
        if (q) {
            const [latitude, longitude, description] = q.split("|");
            const location = new Location(latitude, longitude, description);
            return msg.reply(location);
        }
    } else if (msg.body == "#close") {
        await client.close();
        return process.exit(1);
    }
})

/* client.on("group_participants_update", async (update) => {
    if (!update) return;
    const groupInfo = await client.getGroupMetadata(update.groupId);
    if (update.type == "add") {
        return client.sendMessage(update.groupId, `Welcome to *${groupInfo.subject}*`);
    } else if (update.type == "remove") {
        return client.sendMessage(update.groupId, `Goodbye from *${groupInfo.subject}*`);
    } else if (update.type == "demote") {
        return client.sendMessage(update.groupId, `We loss one admin in *${groupInfo.subject}*`);
    } else if (update.type == "promote") {
        return client.sendMessage(update.groupId, `New admin in *${groupInfo.subject}*`);
    }
}) */
