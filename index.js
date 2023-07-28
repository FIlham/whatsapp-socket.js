"use-strict";

const Constant = require("./src/util/Constants");

module.exports = {
    Client: require("./src/Client"),
    version: require("./package.json").version,

    // structures
    Message: require("./src/structure/Message"),
    MessageMedia: require("./src/structure/MessageMedia"),
    Group: require("./src/structure/Group"),
    GroupNotification: require("./src/structure/GroupNotification"),
    Location: require("./src/structure/Location"),

    ...Constant
}
