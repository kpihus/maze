var events = require('events');
var emitter = new events.EventEmitter();
var tessel = require('tessel');
var port = tessel.port['D'];
var uart = new port.UART({
	baudrate: 115200
});
uart.write(new Buffer([0xB7]));
var speed = 20;
var encReading = 0;
var leftCount = 0;
var rightCount = 0;
var totalError = 0;
var lastError = 0;

var rightMotor = 0xC6;
var leftMotor = 0xC2;


var encSend = 0;
var lineFree = true;

setInterval(function(){
	if(lineFree){
		lineFree = false;
		encSend++;
		uart.write(new Buffer([0xB7]));
	}

}, 50);

uart.on('data', function(data){
	console.log(encReading); //TODO: Remove
	encSend--;
	if(data.readInt16LE(0) == 69){
		if(encReading > 5){
			leftCount += -data.readInt16LE(2);
			rightCount += data.readInt16LE(4);
			adjust();
		} else{
			encReading++;
			lineFree =true;
		}
	}
});

function adjust(){
	console.log('adjust'); //TODO: Remove
	Kp = 0.01;
	Ki = 0;
	Kd = 0;

	var diff = leftCount - rightCount;
	var speedLeft = speed;
	var speedRight = speed;

	totalError += diff;
	var dError = diff - lastError;

	var adjust = Kp * diff + Ki * totalError + Kd * dError;
	speedLeft -= Math.floor(adjust);
	speedRight += Math.floor(adjust);
	lastError = diff;

	console.log(diff, adjust, speedLeft, speedRight, totalError, dError); //TODO: Remove

	uart.write(new Buffer([rightMotor, speedRight]));
	uart.write(new Buffer([leftMotor, speedLeft]));
	lineFree = true;
}

setTimeout(function(){
	setTimeout(function(){
		process.exit();
	}, 500)
}, 15000);






