console.log('Startup'); //TODO: Remove
var events = require('events');

try{
	var tessel = require('tessel');
	var isTessel = true;
} catch(e){
	var isTessel = false;
}
var emitter = new events.EventEmitter();
exports.emmitter = emitter;
exports.isTessel = isTessel;

var maze = [];
exports.maze = maze;

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
var brain = require('./brain.js');

function clone(obj){
	return JSON.parse(JSON.stringify(obj));
}
exports.setDir = function(where){
	currDir = where;
};
exports.getDir = function(){
	return currDir;
};

/*
 I know it's an ugly function, make it better if you can :)
 */
function initialMaze(){
	var count = 1;
	var r2 = 0;
	var c2 = 0;
	for(var r = 0; r < X; r++){
		maze.push([]);
		for(var c = 0; c < Y; c++){
			var dist = 0;
			if(r < Y / 2){
				if(c < X / 2){
					dist = ((X - 2) - c) - r;
				} else{
					dist = (c - 1) - r;
				}
			} else{
				if(c < X / 2){
					dist = ((r - 1) - c);
				} else{
					dist = c2 + r2;
					c2++;
					if(c2 > 7){
						c2 = 0;
						r2++;
					}
				}
			}
			var newCell = clone(cell);
			newCell.nr = count++;
			newCell.dist = dist;
			maze[r].push(newCell);

		}//<- end of cell loop

	}
}


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
		printMaze(maze, currDir);
		console.log('Position: ' + cl); //TODO: Remove)
		console.log('All done, exiting now'); //TODO: Remove
		process.exit();
	}
});

emitter.emit('start');

//initialMaze();
//printMaze(testMaze);
//printMaze(maze);

//while (){
//    setWalls();
//    updateCells();
//}
//printMaze(maze);
