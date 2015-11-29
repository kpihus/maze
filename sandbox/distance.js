var tessel = require('tessel');
var gpio = tessel.port['GPIO'];
var leftSens = gpio.analog[1];
var frontSens = gpio.analog[2];
var rightSens = gpio.analog[3];

setInterval(function(){
	var left = 0;
	var right = 0;
	var front = 0;
	var num = 2;
	for(var i=0; i<num; i++){
		left+=leftSens.read();
		right+= rightSens.read();
		front+= frontSens.read()
	}

	var dist = {
		left: Math.floor(left/num*1000),
		front: Math.floor(front/num*1000),
		right: Math.floor(right/num*1000)
	};


	console.log(JSON.stringify(dist)); //TODO: Remove
},100);

Math.round(4.5);

