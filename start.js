console.log('Startup'); //TODO: Remove
var events = require('events');
var tessel, isTessel, go;

try{
	tessel = require('tessel');
	isTessel = true;
	exports.tessel = tessel;
} catch(e){
	isTessel = false;
}

var workingHB;

var emitter = new events.EventEmitter();
exports.emmitter = emitter;
exports.isTessel = isTessel;

var maze = [];



var X = 16;
var Y = 16;
var cl = [15, 0]; //Current location
var currDir = 0;

var curWalls = {
	north: null,
	south: null,
	east: null,
	west: null
};

exports.cl = cl;
exports.currDir = currDir;
exports.X = X;
exports.Y = Y;
exports.curWalls = curWalls;

var cell = {
	nr: null,
	dist: 10,
	north: false,
	south: false,
	east: false,
	west: false
};

//var comm = require('./comm.js');
var brain = require('./brain');
var legs = require('./legs.js');

go = new legs.motor(tessel, emitter);
//maze = new brain.maze(emitter, motor);


function clone(obj){
	return JSON.parse(JSON.stringify(obj));
}
exports.setDir = function(where){
	currDir = where;
};
exports.getDir = function(){
	return currDir;
};
exports.setCl = function(r, c){
	cl[0] = r;
	cl[1] = c;
};

/*
 I know it's an ugly function, make it better if you can :)
 */

function printMaze(maze, dir){
	process.stdout.write('\033c');
	console.log(cl); //TODO: Remove
//var footrow="";
	for(var r = 0; r < maze.length; r++){
		var row = maze[r];
		var headStr = "";
		var rowStr = "";
		var footrow = "";
		for(var c = 0; c < row.length; c++){
			var here = " ";
			if(cl[0] == r && cl[1] == c){
				switch(dir){
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
			if(r == 0){
				headStr += "+----";
			} else{
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

emitter.on('start', function(){
	initialMaze();
	printMaze(maze, currDir);
	console.log('let the show begin'); //TODO: Remove
	emitter.emit('set_walls');
});

emitter.on('set_walls_done', function(){
	emitter.emit('update_cells');
});

emitter.on('update_done', function(){
	printMaze(maze, currDir);

	emitter.emit('move_forward');
});

emitter.on('turn_done', function(){
	emitter.emit('update_done');
});

emitter.on('moving_done', function(){
	if(cl[0] < X / 2 - 1 || cl[0] > X / 2 || cl [1] < X / 2 - 1 || cl[1] > X / 2){
		emitter.emit('set_walls');
	} else{
		emitter.emit('all_done');
		printMaze(maze, currDir);
		console.log('Position: ' + cl); //TODO: Remove)
		if(isTessel){
			console.log('All done, waiting for new start'); //TODO: Remove
		} else{
			console.log('All done, exit');
			process.exit();
		}
	}
});

emitter.on('start', function(){

});

emitter.on('all_done', function(){

});


emitter.on('test_drive', function(){
	go.startMoving();
	//go.turn(1);
});

emitter.on('stop_moving', function(){
	go.stopMoving();
});

emitter.on('turn', function(where){
	go.turn(where);
});

if(isTessel){
	console.log('Press button to start'); //TODO: Remove
	tessel.button.on('press', function(time){
		console.log('The button was pressed!, starting Up');
		exports.setCl(15, 0);

		setTimeout(function(){
			emitter.emit('test_drive'); //TODO: REMOVE
			//emitter.emit('start');
		},500);

	});
} else{
	emitter.emit('start');
}

