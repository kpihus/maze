var tessel = require('tessel');
var port = tessel.port['D'];
var uart = new port.UART({
	baudrate: 115200
});
var encnr = 0;
var leftEncoder = 0;
var rightEncoder = 0;

//uart.write(new Buffer([0xB7]));
uart.write(new Buffer([0xC9, 3])); //turn

setInterval(function() {
	uart.write(new Buffer([0xB7]));
	//kepalive
}, 100);

uart.on('data', function(data) {
	if(encnr > 3){


	leftEncoder = data.readInt16LE(2);
	rightEncoder = data.readInt16LE(4)
console.log('LEFT: ', leftEncoder, 'RIGHT: ', rightEncoder); //TODO: Remove
	}else{
		encnr++
	}
	});


