"use strict";

const express = require('express');
const router = express.Router();
const radioCommunication = require("./../../radio-communication.js");

router.get('/', function(req, res, next) {
    res.send(radioCommunication.getArduinos());
});

module.exports = router;
