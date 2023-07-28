"use-strict";

class Base {
    constructor(client) {
        /**
         * The client has instiated this
         * @readonly
         */
        Object.defineProperty(this, "client", { value: client });
    }

    _clone() {
        return Object.assign(Object.create(this), this);
    }
    
    _patch(data) { return data; }
}

module.exports = Base
