var main = require('./start');


var motor = function(tessel, emitter) {
	var self = this;
	var brain;
	self.setBrain = function(m) {
		brain = m;
	};
	self.testMode = false;
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

	var sendSerial = process.binding('hw').uart_send;

	//Initialize 3pi
	uart.write(new Buffer([0x81]));
	//Clear encoders in 3pi
	uart.write(new Buffer([0xB7]));
	uart.write(new Buffer([0xB3, 1, 0x45]));

	self.curDir = 0;
	self.curLoc = [15, 0];

	//Inhouse usage variables
	var encoderInterval = 0;
	var encNo = 0;
	var lastError = 0;
	var totalError = 0;
	var lineFree = true;
	var moving = false; //Moving forward
	var turning = false; //Turning
	self.turnTo = 0;
	var waitingForTurn = false;
	var inCalcMode = false;
	var tempBuffer = [];

	//...

	self.masterSpeed = 20; //Master speed
	self.speed = self.masterSpeed; //Will be changed according to front wall

	self.leftCount = 0;
	self.rightCount = 0;
	self.odo = 613;
	self.driveGoal = 3000;

	//Moving commands
	var rightForward = 0xC6;
	var leftForward = 0xC2;
	var rightBackwards = 0xC5;
	var leftBackwards = 0xC1;
	var bothForward = 0xC8;
	var bothBackwards = 0xC7;
	var turnRobot = 0xC9;
	var timeStart, timeEnd;

	self.rightEnc = tessel.port['A'].digital[0];
	self.leftEnc = tessel.port['C'].digital[0];

	self.walls = {left: null, right: null, front: null};

	self.setSpeeds = function(left, right) {
		sendSerial(uart, new Buffer([bothForward, left, right]));
		lineFree = true;
	};

	var updateLocation = function() {
		switch(self.curDir) {
			case 0:
				self.curLoc[0] = self.curLoc[0] - 1;
				break;
			case 1:
				self.curLoc[1] = self.curLoc[1] + 1;
				break;
			case 2:
				self.curLoc[0] = self.curLoc[0] + 1;
				break;
			case 3:
				self.curLoc[1] = self.curLoc[1] - 1;
				break;

		}

	};

	function handleBuffer(buffArr){

		var data = new Buffer(buffArr);
		var cmd = 0;
		try{
			cmd = data.readInt16LE(0);
		}catch (e){
			//Strange buffer, do nothing
		}
		if(cmd == 69){
			self.leftCount += -data.readInt16LE(2);
			self.rightCount += data.readInt16LE(4);
		}

		if(cmd == 69) {
			if(encNo > 2) { //First encoder reading contains legacy values, ingore those
				if(moving) {
					lineFree = true;

					self.odo += Math.round((self.leftCount + self.rightCount) / 2);
					if(self.odo > 612) {
						self.odo = 0;
						self.leftCount =0;
						self.rightCount = 0;

						inCalcMode = false;

						if(waitingForTurn) {
							waitingForTurn = false;
							self.stopMoving();
							emitter.emit('make_turn');
						}
					}
					if(self.odo > 324 && !inCalcMode) { //360 == 90mm
						updateLocation();
						inCalcMode = true;
						emitter.emit('calc');
					}

				}
			} else {
				encNo++;
				lineFree = true;
			}
		}
	}

	//process.on('uart-receive', function(port, data) {
	uart.on('data', function(data) {

		if(data[0]==69 && tempBuffer.length == 0 || tempBuffer.length >0) {
			for(var i = 0; i < data.length; i++) {
				tempBuffer.push(data[i]);
			}

			if(tempBuffer.length > 6) {
				handleBuffer(tempBuffer.slice(0,6));
				tempBuffer=[];
			}
		}



		//var cmd = 0;
		//try{
		//	cmd = data.readInt16LE(0);
		//}catch (e){
		//	//Strange buffer, do nothing
		//}

	});



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
			led.toggle();
			self.readWalls(function(walls) {
				self.walls = walls;
				if(moving) {
					self.adjustMotors();
				}
				//calculateSpeedcoef(walls);
				if(walls.front < 620 && moving) {
					self.stopMoving();
					emitter.emit('calc');
					setTimeout(function() {
						waitingForTurn = false;
						emitter.emit('make_turn');
					}, 500);

				}
				if(lineFree) {
					lineFree = false;
					sendSerial(uart, new Buffer([0xB7]));
				}
				if(!moving && self.turnTo > 0){
					emitter.emit('make_turn');
				}
			});

		}, 90);
	};

	self.adjustMotors = function() {
		if(self.testMode){
			self.setSpeeds(self.masterSpeed, self.masterSpeed);
			return;
		}

		self.readWalls(function(walls) {
			if(walls.left < 800 && walls.right < 800) {
				Kp = 10;
				Ki = 0.2;
				Kd = 3;

				var diff = (walls.left - walls.right) / (walls.left + walls.right);
				var speedLeft = self.speed;
				var speedRight = self.speed;

				totalError += diff;
				var dError = diff - lastError;

				var adjust = Kp * diff + Ki * totalError + Kd * dError;
				if(adjust >= 0) {
					speedLeft -= Math.ceil(adjust);
					speedRight += Math.ceil(adjust);
				}
				else {
					speedLeft -= Math.floor(adjust);
					speedRight += Math.floor(adjust);
				}

				self.setSpeeds(speedLeft, speedRight);
				self.lastError = diff;
				//main.log(diff, adjust, speedLeft, speedRight, totalError, dError, walls.left, walls.right); //TODO: Remove
			} else {
				self.setSpeeds(self.masterSpeed, self.masterSpeed);
			}
		});
	};
	self.startMoving = function() {
		self.odo = 0;
		moving = true;
		lineFree = true;
	};
	self.stopMoving = function() {
		moving = false;
		self.setSpeeds(0, 0);
		self.speed = self.masterSpeed;
	};

	self.turn = function(where) {
		encNo = 0;
		turning = true;
		waitingForTurn = true;
		emitter.once('make_turn', function() {
			moving = false;
			lineFree = false;
			setTimeout(function() {
				sendSerial(uart, new Buffer([turnRobot, where]));
				setTimeout(function() {
					lineFree = true;
					turing = false;
					lastError = 0;
					totalError = 0;
					emitter.emit('turn_done');
				}, 1000);
			}, 500);
		});
		emitter.once('turn_done', function() {

			self.curDir = (self.curDir + where) % 4;
		})
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
			left: 1000 - Math.floor(left / num * 1000),
			front: 1000 - Math.floor(front / num * 1000),
			right: 1000 - Math.floor(right / num * 1000)
		});

	};

	self.startEncoders();

};

exports.motor = motor;
