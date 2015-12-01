var main = require('./start.js');
var testMaze = require('./testMaze.json');
var cl = main.cl;
var currDir = main.currDir;
var isTessel = main.isTessel;
var curWalls = main.curWalls;
var speed = 20;
var leftCount = 0;
var rightCount = 0;
exports.testMaze = testMaze;

var motor = function(tessel, emitter){
	var self = this;
	//Hardware variables
	var led = tessel.led[0];
	var port = tessel.port['D'];
	var gpio = tessel.port['GPIO'];
	var leftSens = gpio.analog[0];
	var frontSens = gpio.analog[4];
	var rightSens = gpio.analog[5];
	var uart = new port.UART({
		baudrate: 115200
	});
	//Initialize 3pi
	uart.write(new Buffer([0x81]));

	//Inhouse usage variables
	var wallInterval = 0;
	var encoderInterval = 0;
	var encNo = 0;
	var lastError = 0;
	var totalError = 0;
	var lineFree = true;
	var moving = false;
	var startTime, endTime;

	//...

	self.masterSpeed = 20; //Master speed
	self.speed = self.masterSpeed; //Will be changed according to front wall

	function map(inmin, inmax, outmin, outmax, value){
		var coef = Math.floor((value - inmin) * (outmax - outmin) / (inmax - inmin) + outmin);
		coef = (coef<outmin) ? outmin : coef;
		coef = (coef>outmax) ? outmax : coef;
		return coef;
	}

	self.leftCount = 0;
	self.rightCount = 0;
	self.odo = 0;
	//Moving commands

	var rightForward = 0xC6;
	var leftForward = 0xC2;
	var rightBackwards = 0xC5;
	var leftBackwards = 0xC1;
	var bothForward = 0xC8;
	var bothBackwards = 0xC7;

	self.rightEnc = tessel.port['A'].digital[0];
	self.leftEnc = tessel.port['C'].digital[0];

	self.walls = {left: null, right: null, front: null};

	uart.on('data', function(data){
		if(data.readInt16LE(0) == 69){
			if(encNo > 5 && moving){
				lineFree = true;
				self.leftCount += -data.readInt16LE(2);
				self.rightCount += data.readInt16LE(4);
				self.odo += Math.round((-data.readInt16LE(2) + data.readInt16LE(4)) / 2);
				self.adjustMotors();
			} else{
				encNo++;
				lineFree = true;
			}
		}
	});

	self.setSpeeds = function(left, right){
		uart.write(new Buffer([bothForward, left, right]));
		lineFree = true;
	};

	function calculateSpeedcoef(walls){
		var distMin = 50;
		var distMax = 750;
		var coefMin = 0;
		var coefMax = 100;
		var distAct = walls.front;

		var speedCoef = coefMin+(coefMax-coefMin)*((distAct-distMin)/(distMax-distMin));

		//var speedCoef = map(50, 750,0,100, walls.front);
		var base = (walls.front>50)?self.masterSpeed-10:self.masterSpeed;

		self.speed = base-(base/100*speedCoef);
	}

	/**
	 * Starting moving forward
	 */

	self.startEncoders = function(){
		encoderInterval = setInterval(function(){
			led.toggle();
			self.readWalls(function(walls){
				calculateSpeedcoef(walls);
				if(walls.front>750){
					process.nextTick(self.stopMoving());
				}
				if(lineFree){
					lineFree = false;
					uart.write(new Buffer([0xB7]));
				}
			});

		}, 11);
	};

	self.checkWalls = function(){
		wallInterval = setInterval(function(){
			self.checkWalls(function(walls){
				self.walls = walls;
				if(walls.front > 550){
					//We have a wall ahead, stop motors.

					process.nextTick(function(){
						self.stopMoving();
					});
				}
			});
		}, 10);
	};

	self.adjustMotors = function(){
		//Tune these to improve pid
		Kp = 0;
		Ki = 0;
		Kd = 0;

		var diff = self.leftCount - self.rightCount;
		var speedLeft = self.speed;
		var speedRight = self.speed;

		totalError += diff;
		var dError = diff - lastError;

		var adjust = Kp * diff + Ki * totalError + Kd * dError;

		speedLeft += Math.floor(adjust);
		speedRight -= Math.floor(adjust);

		self.setSpeeds(speedLeft, speedRight);
		self.lastError = diff;
		//console.log(diff, adjust, speedLeft, speedRight, totalError, dError, self.leftCount, self.rightCount); //TODO: Remove

		self.leftCount = 0;
		self.rightCount = 0;

	};
	self.startMoving = function(){
		moving = true;
		lineFree = true;
		self.startEncoders()

	};
	self.stopMoving = function(){
		moving = false;
			clearInterval(encoderInterval);
			self.setSpeeds(0, 0);

	};

    self.turn = function (where) {
        //TODO: Implement code here
        //One wheel rotation == 360 encoder counts
        //For a 360deg turn, wheel has to drive 283mm
        //For a 90deg turn, wheel has to drive 71mm
        //One wheel rotation is 100mm
        //For a 90deg, we need 256 odo ticks
        //NB based on calculations, actual may be different

        self.turnTo = function (leftCommand, rightCommand, numberOfCounts) {
            var turnSpeed = self.speed / 2;
            self.leftCount = 0;
            self.rightCount = 0;

            while (rightCount < numberOfCounts || leftCount < numberOfCounts) {
                self.uart.write(new Buffer([rightCommand, turnSpeed]));
                self.uart.write(new Buffer([leftCommand, turnSpeed]));
            }

            self.setSpeeds(0, 0);
            self.leftCount = 0;
            self.rightCount = 0;
        };

        var direction = main.currDir;
        var turning = direction - where;
        var ninetyDegreeClicks = 256;

        if (turning == 1 || turning == -3) {
            self.turnTo(self.leftBackwards, self.rightForward, ninetyDegreeClicks);
        } else if (turning == -1 || turning == 3) {
            self.turnTo(self.leftForward, self.rightBackwards, ninetyDegreeClicks);
        } else if (turning == -2 || turning == 2) {
            self.turnTo(self.leftForward, self.rightBackwards, 2*ninetyDegreeClicks);
        }

        main.setDir(where);

    };

	self.readWalls = function(callback){

		var left = 0;
		var right = 0;
		var front = 0;
		var num = 2;
		for(var i = 0; i < num; i++){
			left += leftSens.read();
			right += rightSens.read();
			front += frontSens.read()
		}
		callback({
			left: Math.floor(left / num * 1000),
			front: Math.floor(front / num * 1000),
			right: Math.floor(right / num * 1000)
		});

	};

	//Emitter listeners





};

exports.motor = motor;

//emitter.on('stop_moving', stop());

/*
 Moves forward by one cell
 And updates current location
 */
//emitter.on('move_forward', function moveForward(){
//	//TODO: add moving control here
//
//	switch(main.getDir()){
//		case 0:
//			cl[0] = cl[0] - 1;
//			break;
//		case 1:
//			cl[1] = cl[1] + 1;
//			break;
//		case 2:
//			cl[0] = cl[0] + 1;
//			break;
//		case 3:
//			cl[1] = cl[1] - 1;
//			break;
//	}
//
//	if(!isTessel){
//		//Dummy timeout to emulate moving for now
//		setTimeout(function(){
//			emitter.emit('moving_done');
//		}, 50);
//	} else{
//		emitter.emit('moving_done');
//	}
//});

//emitter.on('check_walls', function(){
//	//TODO: dummy for now, data is taken from test Maze
//	var item = testMaze[cl[0]][cl[1]];
//	curWalls.north = item.north;
//	curWalls.south = item.south;
//	curWalls.east = item.east;
//	curWalls.west = item.west;
//
//	//TODO: emulate timeout for now
//	setTimeout(function(){
//		emitter.emit('check_walls_done');
//	}, 100);
//
//});

/*
 where: [
 0: north,
 1: east,
 2: south,
 3: west
 ]
 */
//emitter.on('turn', function turn(where){
//	var amount = (where - currDir) * 90;
//	//TODO: add turning control here
//	main.setDir(where);
//	setTimeout(function(){
//		emitter.emit('turn_done');
//	}, 50);
//
//});


