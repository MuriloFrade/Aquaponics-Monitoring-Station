const radio = require('./services/nrf24l01.js');
const Arduino = require("./models/arduino.js");
const events = require("events");

let radioCommunication = new events.EventEmitter();

const responseDelay = 200;
const maxTimeouts = 10;

const sendMethods = {
    ping: "001",
    getPHTemperature: "002",
    getTemperature: "003"
};

const receiveMethods = {
    pong: "001",
    pHTemperature: "002",
    temperature: "003"
};

let arduinos = []
    ;

function pingToArduinos() { 
    let arduinosDisconnected = removeArduinosWithTimeout();
   // console.log("last connected: ");  console.log(arduinos); 
    arduinos.forEach( (a) => a.timeoutsCount++ );
    radio.sendMessage(createMsg(sendMethods.ping));
}

function removeArduinosWithTimeout() {
    let indexes = [];
    let removed = [];
    arduinos.forEach((a, i) => {
        if(a.timeoutsCount >= maxTimeouts)
            indexes.push(i);
    });    

    if(indexes.length > 0){
        indexes.forEach((i) => {
            let deleted = arduinos.splice(i, 1);
            removed = removed.concat(deleted);
            radioCommunication.emit("arduinooff", deleted[0].id);
        });
        console.log("[RADIO COMMUNICATION] Arduinos disconnected: " + JSON.stringify(removed));
    }

    return removed;
}

function getPhAndTemperatureFromArduino(id) { 
    radio.sendMessage(createMsg(sendMethods.getPHTemperature, [id]));
}

function createMsg(method, params) {
    let msg;
    switch (method) {
        case sendMethods.ping:
            msg = method.concat(addZerosToRigth(""));
            break;
        case sendMethods.getPHTemperature:
            msg = method.concat(addZerosToRigth(params[0]));
            break;
        default:
            break;
    }

    return msg;
}

function addZerosToRigth(str) {
    let extraParamLength = 29;
    let zeros = "0".repeat(extraParamLength - str.length);
    return str.concat(zeros);
}

radio.onNewMessage((msg) => {
    //console.log("radio received: " + msg);
    let method = msg.substring(0, 3);
    switch (method) {
        case receiveMethods.pong:
            updateArduinoConnectedPong(msg);
            break;
        case receiveMethods.pHTemperature:
            getPHTemperatureFromMsg(msg);
        break;

        default:
            break;
    }
});

function updateArduinoConnectedPong(msg){
    let arduinoId = msg.substring(3, 6);
    let index = getArduinoIndex(arduinoId);
    if(index === -1){
        let arduino = new Arduino(arduinoId);
        arduinos.push(arduino);
        console.log("[RADIO COMMUNICATION] New arduino connected: id: "  + arduino.id);
        radioCommunication.emit("arduinoon", arduino.id);
    }else{
        arduinos[index].timeoutsCount = 0;
    }
}

function getPHTemperatureFromMsg(msg){
    let arduinoId = msg.substring(3, 6);
    let phStr = msg.substring(6, 10);
    let ph = parseFloat(phStr.substring(0, 2) + "." + phStr.substring(2));
    let tempStr = msg.substring(10, 16);
    let temperature = parseFloat(tempStr.substring(0, 4) + "." + tempStr.substring(4));
    updateArduino(arduinoId, ph, temperature);
}

function updateArduino(id, pH, temperature) {
    let index = getArduinoIndex(id);
    if(index !== -1){
        arduinos[index].pH = pH;
        arduinos[index].temperature = temperature;
    }
}

function getArduinoIndex(id){
    let index = -1;
    arduinos.forEach((a, i) => {
        if(a.id == id) index = i;
    });
    return index;
}

radio.onSendMessageError((error) => {
    if(arduinos.length > 0) 
        console.log("[RADIO COMMUNICATION]", error);
});

function callFunctionsWithTimeout(timeout) {
    let count = 1;

    setTimeout(pingToArduinos , timeout);
    count++;

    arduinos.forEach((a) => {
        setTimeout(getPhAndTemperatureFromArduino, timeout * count, a.id)
        count++;
    });

    setTimeout(callFunctionsWithTimeout, timeout * (count - 1), timeout);
}

radioCommunication.getArduinos = () => arduinos;
radioCommunication.begin = function(){

    callFunctionsWithTimeout(responseDelay);

}

module.exports = radioCommunication;
