var events = require('events');
var emitter = new events.EventEmitter();
var tessel = require('tessel');
var port = tessel.port['D'];
var uart = new port.UART({
	baudrate: 115200
});

var speed = 20;

var leftCount = 0;
var rightCount = 0;

var rightMotor = 0xC6;
var leftMotor = 0xC2;

var rightEnc = tessel.port['A'].digital[0];
var leftEnc = tessel.port['C'].digital[0];

leftEnc.on('rise', function(time, type){
	leftCount++;
	//equalDrive();

});

rightEnc.on('rise', function(time, type){
	rightCount++;
	//equalDrive();
});

function equalDrive(){
	if(leftCount !== rightCount){
		emitter.emit('correct');
	}
}

//uart.write(new Buffer([0x81]));

//uart.write(new Buffer([rightMotor, speed.toString(16)]));
//uart.write(new Buffer([leftMotor, speed.toString(16)]));

uart.on('data', function(data){
	console.log('received:', data);
});
function setSpeeds(left, right){
	console.log('setSpeed'); //TODO: Remove
	uart.write(new Buffer([rightMotor, right]));
	uart.write(new Buffer([leftMotor, left]));
	console.log('speed Set'); //TODO: Remove
}

//setSpeeds(40, 40);
setInterval(function(){
	var diff = leftCount - rightCount;
	var speedLeft = speed;
	var speedRight = speed;

	if(diff > 0){
		speedLeft = speed - diff;
		speedRight = speed + diff;
	}
	if(diff < 0){
		speedLeft = speed + diff;
		speedRight = speed - diff;
	}

	console.log(diff, ' ::: ', speedLeft, ' ---- ', speedRight); //TODO: Remove
	setSpeeds(speedLeft, speedRight);
	leftCount = 0;
	rightCount = 0;
}, 100);





