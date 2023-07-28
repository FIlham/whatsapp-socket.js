"use-strict";

exports.DefaultOptions = {
    sessionName: "wssocket.js",
    self: false,
    statusMsg: false
}

/**
 * Socket events
 * @readonly
 * @enum {string}
 */
exports.Events = {
    CONNECTING: "connecting",
    QR: "qr",
    READY: "ready",
    MESSAGE: "message",
    MESSAGE_CREATE: "message_create"
}
