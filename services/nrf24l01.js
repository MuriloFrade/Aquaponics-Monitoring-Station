"use strict";

let spiDev = "/dev/spidev0.0",
    cePin = 25, //pin 22 -> gpio 25  
    irqPin = 24, //pin 18 -> gpio 24
    writePipe = 0xF0F0F0F0E1,
    listenPipe = 0xF0F0F0F0D2;

let radio = require('nrf').connect(spiDev, cePin, irqPin);

radio.channel(0x4c)
     .dataRate('1Mbps')
     .crcBytes(2)
     .transmitPower('PA_MAX')
     .autoRetransmit({count:15, delay:4000})
     ;

let tx, 
    rx,
    txIsReady = false,
    rxIsReady = false,
    onRxDataCb,
    onTxErrorCb;

radio.begin(function () {
    // tx pipe
    tx = radio.openPipe('tx', writePipe);
    configTxEvents();

    rx = radio.openPipe('rx', listenPipe);
    configRxEvents();
});

function configTxEvents() {
    tx.on('ready', function (p) {
        txIsReady = true;
    });

	tx.on('data', function(d) {
		console.log("Recieved in tx: ", reverseStr(d.toString('utf8')));  		
	});

    tx.on('error', function(e) {
		//console.log("Tx error:", e);
        onTxErrorCb(e);
    });
}

function configRxEvents() {
	rx.on('ready', function (p) {
        rxIsReady = true;
    });    
    rx.on('data', function(d) {
        onRxDataCb(reverseStr(d.toString('utf8')));		
	});
	rx.on('error', function(e) {
		console.log("Rx error:", e);
    });
}

function reverseStr(s) {
    return s.split("").reverse().join("");
}

function sendMessage (msg) {
    if(txIsReady){
        tx.write(msg);
    }else{
        setTimeout(sendMessage, 20, msg)
    }
}

function onNewMessage(cb) {
    onRxDataCb = cb;
}
function onSendMessageError(cb){
    onTxErrorCb = cb;
}
exports.sendMessage = sendMessage;
exports.onNewMessage = onNewMessage;
exports.onSendMessageError = onSendMessageError;