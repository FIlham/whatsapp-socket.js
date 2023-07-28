"use-strict";

/**
 * Location class
 */
class Location {
    /**
     * @param {number} latitude 
     * @param {number} longitude 
     * @param {?string} description 
     */
    constructor(latitude, longitude, description) {
        /** 
         * Latitude of location
         * @type {number}
         */
        this.latitude = latitude;
        /** 
         * Longitude of location 
         * @type {number}
         */
        this.longitude = longitude;
        /**
         * Description of location
         * @type {?string}
         */
        this.description = description;
    }
}

module.exports = Location;
