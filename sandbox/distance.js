var tessel = require('tessel');
var gpio = tessel.port['GPIO'];
var leftSens = gpio.analog[0];
var frontSens = gpio.analog[4];
var rightSens = gpio.analog[5];

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
		left: 1000-Math.floor(left/num*1000),
		front: 1000-Math.floor(front/num*1000),
		right: 1000-Math.floor(right/num*1000)
	};

	console.log(JSON.stringify(dist)); //TODO: Remove
},100);



