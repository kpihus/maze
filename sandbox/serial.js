var tessel = require('tessel');
var port = tessel.port['D'];
var uart = new port.UART({
	baudrate: 250000
});

var leftEncoder = 0;
var rightEncoder = 0;


//uart.write(new Buffer([0xB7]));
uart.write(new Buffer([0xC9, 3]));

setInterval(function(){
	uart.write(new Buffer([0xB7]));
}, 5);




//
uart.on('data', function (data) {
	console.log(data); //TODO: Remove
	console.log(data.readInt16LE(0)); //TODO: Remove
	//console.log('received:',data, data.readInt16LE(0),, );
if(data.readInt16LE(0)==69){
	console.log('enc reading'); //TODO: Remove
}if(data.readInt16LE(0)==66){
	console.log('turn done'); //TODO: Remove
}
//else if(data.readInt16LE(0)==99){
//	console.log('turn done'); //TODO: Remove
//	process.exit();

});
