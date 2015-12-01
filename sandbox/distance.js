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
		left: Math.floor(left/num*1000),
		front: Math.floor(front/num*1000),
		right: Math.floor(right/num*1000)
	};

var coef = map(50, 750, 0, 100, dist.front);


	console.log(dist.front, coef); //TODO: Remove
},100);

function map(inmin, inmax, outmin, outmax, value){
	var coef = Math.floor((value - inmin) * (outmax - outmin) / (inmax - inmin) + outmin);
	coef = (coef<outmin) ? outmin : coef;
	coef = (coef>outmax) ? outmax : coef;
	return coef;
}

