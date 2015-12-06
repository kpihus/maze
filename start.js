console.log('Startup');
var events = require('events');
var tessel, isTessel, go, brain;
var testMode = true;

try {
	tessel = require('tessel');
	isTessel = true;
	exports.tessel = tessel;
} catch(e) {
	isTessel = false;
}

exports.log = function(text){
	var dolog = true;
	if(dolog){
		console.log(text); //TODO: Remove
	}
}

var emitter = new events.EventEmitter();
exports.emmitter = emitter;
exports.isTessel = isTessel;

var logic = require('./brain');
var legs = require('./legs');

go = new legs.motor(tessel, emitter);
brain = new logic.brain(emitter);
brain.setGo(go);
go.setBrain(brain);
brain.testMode = false;
go.testMode = false;

/*
 I know it's an ugly function, make it better if you can :)
 */

function printMaze(maze, dir) {
	process.stdout.write('\033c');
	console.log(cl); //TODO: Remove
//var footrow="";
	for(var r = 0; r < maze.length; r++) {
		var row = maze[r];
		var headStr = "";
		var rowStr = "";
		var footrow = "";
		for(var c = 0; c < row.length; c++) {
			var here = " ";
			if(cl[0] == r && cl[1] == c) {
				switch(dir) {
					case 0:
						here = "^";
						break;
					case 2:
						here = "v";
						break;
					case 1:
						here = ">";
						break;
					case 3:
						here = "<";
						break;
				}
			}

			footrow += "+----";
			if(r == 0) {
				headStr += "+----";
			} else {
				headStr += (row[c].north == true && maze[r - 1][c].south == true) ? "+----" : "+    ";
			}
			rowStr += (c == 0) ? "|" : "";
			rowStr += (row[c].dist > 9) ? here : " " + here;
			rowStr += row[c].dist;
			rowStr += (row[c].east == true && row[c + 1].west == true ) ? " |" : "  ";
			rowStr += (c == row.length - 1) ? "|" : "";
		}
		console.log(headStr + '+');
		console.log(rowStr);
	}
	console.log(footrow + '+');
}



//new event logic



function isItEnd(){
	var cl = go.curLoc;
	if(cl[0] < X / 2 - 1 || cl[0] > X / 2 || cl [1] < X / 2 - 1 || cl[1] > X / 2) {
		return false;
	} else {
		return true;
	}
}

emitter.on('calc', function() {
	if(isItEnd()){process.exit()}
	brain.calc(function(res) {
		if(res) {
			//TODO: Decide is it end
			if(go.turnTo > 0) {
				console.log('Turn to', go.turnTo); //TODO: Remove
				go.turn(go.turnTo);
			} else {
				emitter.emit('move_forward');
			}
		}
	});
});

emitter.on('move_forward', function() {
	exports.log('Start moving forward');
	go.startMoving();
});

emitter.on('turn_done', function() {

	emitter.emit('move_forward');
});

if(isTessel) {
	tessel.button.on('press', function() {
	setTimeout(function(){
		emitter.emit('calc');
	},200);


	});
} else {

}

