const radioComunication = require("./radio-communication.js");
const kotoriService = require("./services/kotori.js");
const webApp = require("./web-app/web-app.js");

radioComunication.begin();

kotoriService.begin({
    attributesToSave: ["temperature", "pH"],
    intervalToSave: 60000 
});



