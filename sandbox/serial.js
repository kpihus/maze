var tessel = require('tessel');
var port = tessel.port['D'];
var uart = new port.UART({
	baudrate: 115200
});

var leftEncoder = 0;
var rightEncoder = 0;


//uart.write(new Buffer([0xB7]));


setInterval(function(){
	uart.write(new Buffer([0xB7]));
}, 50);

setInterval(function(){
	console.log(leftEncoder, rightEncoder); //TODO: Remove
},100);



uart.on('data', function (data) {
	//console.log('received:',data, data.readInt16LE(0),, );
	var encoders = {
		left: data.readInt16LE(2),
		right: data.readInt16LE(4)
	};

	leftEncoder = leftEncoder + -encoders.left;
	rightEncoder = rightEncoder + encoders.right;
});
