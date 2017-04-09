"use strict";

module.exports = class Arduino {
    constructor(id){
        this.id = id;
        this.pH = 0.0;
        this.temperature = 0.0;
        this.timeoutsCount = 0;
    }
}
