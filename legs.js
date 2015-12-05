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

var motor = function(tessel, emitter) {
	var self = this;
	var maze;
	self.setMaze = function(m) {
		maze = m;
	};
	//Hardware variables
	var led = tessel.led[0];
	var port = tessel.port['D'];
	var gpio = tessel.port['GPIO'];
	var leftSens = gpio.analog[0];
	var frontSens = gpio.analog[4];
	var rightSens = gpio.analog[5];
	var uart = new port.UART({
		baudrate: 250000
	});

	var sendSerial = process.binding('hw').uart_send;

	//Initialize 3pi
	uart.write(new Buffer([0x81]));
	//Clear encoders in 3pi
	uart.write(new Buffer([0xB7]));

	//Inhouse usage variables
	var encoderInterval = 0;
	var encNo = 0;
	var lastError = 0;
	var totalError = 0;
	var lineFree = true;
	var moving = false; //Moving forward
	var turning = false; //Turning
	var turnTo = 0;

	//...

	self.masterSpeed = 10; //Master speed
	self.speed = self.masterSpeed; //Will be changed according to front wall

	self.leftCount = 0;
	self.rightCount = 0;
	self.odo = 0;
	//2000 counts == 60cm
	self.driveGoal = 3000;
	console.log('ODO', self.odo); //TODO: Remove

	//Moving commands
	var rightForward = 0xC6;
	var leftForward = 0xC2;
	var rightBackwards = 0xC5;
	var leftBackwards = 0xC1;
	var bothForward = 0xC8;
	var bothBackwards = 0xC7;
	var timeStart, timeEnd;

	self.rightEnc = tessel.port['A'].digital[0];
	self.leftEnc = tessel.port['C'].digital[0];

	self.walls = {left: null, right: null, front: null};

	process.on('uart-receive', function(port, data) {

		if(data.readInt16LE(0) == 69) {
			if(encNo > 2) { //First encoder reading contains legacy values, ingore those
				if(moving) {
					lineFree = true;
					self.leftCount = -data.readInt16LE(2);
					self.rightCount = data.readInt16LE(4);
					self.odo = Math.round((-data.readInt16LE(2) + data.readInt16LE(4)) / 2);
					if(self.odo >= self.driveGoal) {
						console.log(self.odo); //TODO: Remove
						setImmediate(self.stopMoving());
					} else {
						self.adjustMotors();
					}
				} else if(turning) {
					lineFree = true;
					self.leftCount = -data.readInt16LE(2);
					self.rightCount = data.readInt16LE(4);

					checkTurn();
				}
			} else {
				encNo++;
				lineFree = true;
			}
		}
	});

	self.setSpeeds = function(left, right) {
		sendSerial(uart, new Buffer([bothForward, left, right]));
		lineFree = true;
	};

	/**
	 * Slow down if wall ahead is detected
	 * @param walls
	 */
	function calculateSpeedcoef(walls) {
		var adjust = Math.floor(Math.sqrt(14.3 * walls.front - 720));
		if(moving) {
			self.speed = (isNaN(adjust)) ? 20 : self.masterSpeed - (self.masterSpeed / 100 * adjust);
		}
	}

	/**
	 * Starting moving forward
	 */

	self.startEncoders = function() {
		encoderInterval = setInterval(function() {
			self.readWalls(function(walls) {
				//calculateSpeedcoef(walls);
				//if(walls.front > 750 && moving) {
				//	process.nextTick(self.stopMoving());
				//}
				if(lineFree) {
					lineFree = false;
					uart.write(new Buffer([0xB8]));
				}
			});

		}, 310);
	};

	self.adjustMotors = function() {
		led.toggle();
		self.readWalls(function(walls) {
			if(walls.left < 800 && walls.right < 800) {
				Kp = 0.0001;
				Ki = 0.000;
				Kd = 0.00;

				var diff = walls.left - walls.right;
				var speedLeft = self.speed;
				var speedRight = self.speed;

				totalError += diff;
				var dError = diff - lastError;

				var adjust = Kp * diff + Ki * totalError + Kd * dError;

				speedLeft += Math.floor(adjust);
				speedRight -= Math.floor(adjust);

				self.setSpeeds(speedLeft, speedRight);
				self.lastError = diff;
				console.log(diff, adjust, speedLeft, speedRight, totalError, dError, walls.left, walls.right); //TODO: Remove
			}else{
				self.setSpeeds(self.masterSpeed, self.masterSpeed);
			}

		});
	};
	self.startMoving = function() {
		self.odo = 0;
		moving = true;
		lineFree = true;
		self.startEncoders();
	};
	self.stopMoving = function() {
		moving = false;
		clearInterval(encoderInterval);

		self.setSpeeds(0, 0);
		self.speed = self.masterSpeed;
	};

	//Turn handling
	var leftGoal = 0;
	var rightGoal = 0;

	var checkTurn = function() {
		if(self.leftCount >= leftGoal || self.rightCount >= rightGoal) {
			turning = false;
			self.setSpeeds(0, 0);
			clearInterval(encoderInterval);
			console.log('CheckTurn', leftGoal, self.leftCount, rightGoal, self.rightCount); //TODO: Remove

			self.leftCount = 0;
			self.rightCount = 0;

		}
		lineFree = true;
	};

	self.turn = function() {
		encNo = 0;
		turning = true;
		//TODO: Implement code here
		//One wheel rotation == 360 encoder counts
		//For a 360deg turn, wheel has to drive 283mm
		//For a 90deg turn, wheel has to drive 71mm
		//One wheel rotation is 100mm
		//For a 90deg, we need 256 odo ticks
		//NB based on calculations, actual may be different

	};

	self.readWalls = function(callback) {

		var left = 0;
		var right = 0;
		var front = 0;
		var num = 2;
		for(var i = 0; i < num; i++) {
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


