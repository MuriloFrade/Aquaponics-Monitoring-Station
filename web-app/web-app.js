"use strict";

const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const webSockerServer = require('./websocket-server.js');

const port = 80;

webSockerServer(http);

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//routes
app.use('/', require("./routes/index.js"));
app.use('/arduinos', require("./routes/arduinos.js"));

http.listen(port, function () {
  console.log('[WEB APP] Listening on port ' + port);
});
