"use strict";

const exec = require('child_process').exec;
const radioCommunication = require("./../radio-communication.js");

// first restart kotori
exec("sudo systemctl restart kotori", (err, stdout, stderr) => { 
    if (err) {        
        console.error(err);
        return;
    }                            
});

function saveArduinoData(arduino, attributes) {

    let data = {}; 
    attributes.forEach( (a) => data[a] = arduino[a]);

    const cmd = getMosquittoCmd(arduino.id, arduino.id, data)

    exec(cmd, (err, stdout, stderr) => { 
        if (err) {
            console.error("Error in mosquitto cmd: " + cmd);
            console.error(err);
            return;
        }                            
    });
    
}

function getMosquittoCmd(local, device, data) {
    const cmd = `mosquitto_pub -t aquaponic/arduino/arduino-${local}/${device}/data.json -m '${JSON.stringify(data)}'`;
    return cmd;
}

function begin(params) {

    setInterval(() => {
        let arduinos = radioCommunication.getArduinos();         
        if(arduinos.length > 0){
            arduinos.forEach((a) => saveArduinoData(a, params.attributesToSave));
            console.log("[KOTORI] Arduinos data saved: " + JSON.stringify(arduinos));
        }
    }, params.intervalToSave);

}

exports.begin = begin;