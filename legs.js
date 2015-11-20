var main = require('./start.js');
var emitter = main.emmitter;
var testMaze = require('./testMaze.json');
var cl = main.cl;
var currDir = main.currDir;
var isTessel = main.isTessel;
var curWalls = main.curWalls;
var speed = 20;
var leftCount = 0;
var rightCount = 0;
exports.testMaze = testMaze;


var motor = function(tessel){
	var self = this;
	//Tune these to improve pid
	self.Kp = 1;
	self.Ki = 0;
	self.Kd = 0;
	//...
	self.speed = 20; //Master speed
	self.leftCount = 0;
	self.rightCount = 0;
	self.odo = 0;
	self.rightForward = 0xC6;
	self.leftForward = 0xC2;
	self.rightBackwards = 0xC5;
	self.leftBackwards = 0xC1;
	self.rightEnc = tessel.port['A'].digital[0];
	self.leftEnc = tessel.port['C'].digital[0];
	self.COM = tessel.port['D'];
	self.uart = new COMM.UART({baudrate: 115200});
	self.driveInterval = 0;
	//Read encoders
	self.leftEnc.on('rise', function(time, type){
		self.leftCount++;
		self.setOdo();
	});
	self.rightEnc.on('rise', function(time, type){
		self.rightEnc++;
		self.setOdo();
	});

	self.setOdo = function(){
		//62 ticks == 10cm
		slef.odo += Math.round((self.rightEnc+self.leftEnc)/2);;
	};

	self.setSpeeds = function(left, right){
		self.uart.write(new Buffer([self.rightForward, right]));
		self.uart.write(new Buffer([self.leftForward, left]));
	};

	self.moveForward = function(){
		//TODO: implement integral and derivative !!!
		//https://solderspot.wordpress.com/2014/01/29/pid-controllers-101/

		var diff = self.leftCount - self.rightCount;
		var speedLeft = self.speedl;
		var speedRight = self.speed;

		if(diff > 0){
			speedLeft -= self.Kp*diff;
			speedRight += self.Kp*diff;
		}
		if(diff < 0){
			speedLeft += self.Kp*diff;
			speedRight -= self.Kp*diff;
		}

		self.setSpeeds(speedLeft, speedRight);

		//TODO: Probably seting them to zero eatch time is not good idea
		self.leftCount = 0;
		self.rightCount = 0;
	};
	self.startMoving = function(){
		self.driveInterval = setInterval(function(){
			self.moveForward();
		}, 100)
	};
	self.stopMoving = function(){
		clearInterval(self.driveInterval);
		self.setSpeeds(0,0);
	};

	self.turn = function(where){
		//TODO: Implement code here
		//One wheel rotation == 62 encoder counts
		//For a 360deg turn, wheel has to drive 283mm
		//For a 90deg turn, wheel has to drive 71mm
		//One wheel rotation is 100mm
		//For a 90deg, we need 44 odo ticks
		//NB based on calcultions, actual may be different

	}
};

exports.motor = motor;

var rightMotor = 0xC5;
var leftMotor = 0xC1;

/*
 1 REV = 62 count

 */

emitter.on('stop_moving', stop());

/*
 Moves forward by one cell
 And updates current location
 */
emitter.on('move_forward', function moveForward(){
	//TODO: add moving control here

	switch(main.getDir()){
		case 0:
			cl[0] = cl[0] - 1;
			break;
		case 1:
			cl[1] = cl[1] + 1;
			break;
		case 2:
			cl[0] = cl[0] + 1;
			break;
		case 3:
			cl[1] = cl[1] - 1;
			break;
	}

	if(!isTessel){
		//Dummy timeout to emulate moving for now
		setTimeout(function(){
			emitter.emit('moving_done');
		}, 50);
	} else{
		emitter.emit('moving_done');
	}
});

emitter.on('check_walls', function(){
	//TODO: dummy for now, data is taken from test Maze
	var item = testMaze[cl[0]][cl[1]];
	curWalls.north = item.north;
	curWalls.south = item.south;
	curWalls.east = item.east;
	curWalls.west = item.west;

	//TODO: emulate timeout for now
	setTimeout(function(){
		emitter.emit('check_walls_done');
	}, 100);

});

/*
 where: [
 0: north,
 1: east,
 2: south,
 3: west
 ]
 */
emitter.on('turn', function turn(where){
	var amount = (where - currDir) * 90;
	//TODO: add turning control here
	main.setDir(where);
	setTimeout(function(){
		emitter.emit('turn_done');
	}, 50);

});


