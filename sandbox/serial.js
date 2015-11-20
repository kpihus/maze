var tessel = require('tessel');
var port = tessel.port['D'];
var uart = new port.UART({
	baudrate: 115200
});

uart.write(new Buffer([0xB1]));



var speed = 50;
var stop=0;
var right = 0xC6;
var left = 0xC2;

setInterval(function(){
	speed--;
	var hSpee = speed.toString(16);
	console.log(hSpee); //TODO: Remove
	uart.write(new Buffer([right, speed]));
	//uart.write(new Buffer([left, speed.toString(16)]));
	if(speed <0){
		uart.write(new Buffer([right, 0x0]));
		//uart.write(new Buffer([left, 0x0]));
		setTimeout(function(){
			process.exit();
		},500);
	}
},1000);





uart.on('data', function (data) {
	console.log('received:', data);
});

// UART objects are streams!
// pipe all incoming data to stdout:
uart.pipe(process.stdout);