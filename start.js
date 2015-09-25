
var maze = [];

var X = 16;
var Y = 16;

var cell = {
	nr: null,
	dist: 10,
	north: false,
	south: false,
	east: false,
	west: false
};

function clone(obj){	return JSON.parse(JSON.stringify(obj));}

function initialMaze() {

	var count = 1;
	for(var r = 0; r < X; r++) {
		maze.push([]);
		for(var c = 0; c < Y; c++) {
			//var dist = Math.abs(X/2-r)+Math.abs(Y/2-c);
			var dist = 0;
			if(r< Y /2 ) {
				if(c < X / 2) {
					dist = ((X - 2) - c) - r;
				} else {
					dist = (c - 1) - r;
				}
			} else {
				if(c < X / 2) {
					dist = ((X - 2) - c) - r;
				} else {
					dist = (c - 1) - r;
				}
			}

			var newCell = clone(cell);
			newCell.nr = count++;
			newCell.dist = dist;

			maze[r].push(newCell);
		}
	}
}


function printMaze(){
//var footrow="";
	for(var r=0; r<maze.length; r++){
		var row = maze[r];
		var headStr = "";
		var rowStr = "";
		var footrow="";
		for(var c=0; c<row.length; c++){
			headStr += (r==0)? "+----": "+    ";
			footrow += "+----";
			rowStr += (c==0)? "|":" ";
			rowStr += (row[c].dist > 9) ? " ": "  ";
			rowStr += row[c].dist+" ";
			rowStr += (c==row.length-1)? "|":"";
		}
		console.log(headStr+'+');
		console.log(rowStr);
	}
	console.log(footrow+'+');
}


initialMaze();
printMaze();