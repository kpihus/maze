var tessel = require('tessel');
var gpio = tessel.port['GPIO'];
var leftSens = gpio.analog[0];
var frontSens = gpio.analog[1];
var rightSens = gpio.analog[2];

setInterval(function(){
	var left = 0;
	var right = 0;
	var front = 0;

	for(var i=0; i<10; i++){
		left+=leftSens.read();
		right+= rightSens.read();
		front+= frontSens.read()
	}

	var dist = {
		left: Math.floor(left/10*1000),
		front: Math.floor(front/10*1000),
		right: Math.floor(right/10*1000)
	}


	console.log(dist); //TODO: Remove
},100);
