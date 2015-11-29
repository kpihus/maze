// Import the interface to Tessel hardware
var tessel = require('tessel');
var port = tessel.port['D'];
var uart = new port.UART({
	baudrate: 115200
});

// Set the led pins as outputs with initial states
// Truthy initial state sets the pin high
// Falsy sets it low.
var led1 = tessel.led[0].output(1);
var led2 = tessel.led[1].output(0);
var pin1 = tessel.port['A'].digital[0];
var pin2 = tessel.port['C'].digital[0];
var p1c = 0;
var p2c = 0;

pin1.on('change', function(time, type){
	console.log('P1: ', p1c++); //TODO: Remove
});
pin2.on('change', function(time, type){
	console.log('P2: ', p2c++); //TODO: Remove
});

var speed = 50;
var stop = 0;
//
//uart.write(new Buffer([0xC5, speed.toString(16)]));
//uart.write(new Buffer([0xC1, speed.toString(16)]));

setInterval(function(){
	// Toggle the led states
	led1.toggle();
	led2.toggle();
}, 100);
