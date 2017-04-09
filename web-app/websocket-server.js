"use strict";

const Server = require('socket.io');
const radioCommunication = require("./../radio-communication.js");

function initRadioCommunicationListeners(io){
    radioCommunication.on("arduinoon", (arduinoId) => {
        io.emit("alert", `Arduino ${arduinoId} is connected.`);
    });
    radioCommunication.on("arduinooff", (arduinoId) => {
        io.emit("alert", `Arduino ${arduinoId} is offline.`);
    });
}

module.exports = function (httpServer) {
    
    const io = new Server(httpServer);
    
    io.on('connection', function (socket) {        
        socket.on('disconnect', function () {
            
        });
    });

    initRadioCommunicationListeners(io);

};