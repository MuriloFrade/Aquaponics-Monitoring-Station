"use strict";

const express = require('express');
const path = require('path');
const router = express.Router();
const radioCommunication = require("./../../radio-communication.js");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render("index", { arduinos: radioCommunication.getArduinos() });
});

module.exports = router;
