var maze = [];
var testMaze = require('./testMaze.json');

var X = 16;
var Y = 16;
var currLoc = 241;
var currDir ='north';

var cell = {
	nr: null,
	dist: 10,
	north: false,
	south: false,
	east: false,
	west: false
};

function clone(obj) {
	return JSON.parse(JSON.stringify(obj));
}

/*
I know it's an ugly function, make it better if you can :)
 */
function initialMaze() {

	var count = 1;
	var r2 = 0;
	var c2 = 0;
	for(var r = 0; r < X; r++) {
		maze.push([]);
		for(var c = 0; c < Y; c++) {

			var dist = 0;
			if(r < Y / 2) {
				if(c < X / 2) {
					dist = ((X - 2) - c) - r;
				} else {
					dist = (c - 1) - r;
				}
			} else {

				if(c < X / 2) {
					dist = ((r - 1) - c);
				} else {

					dist = c2+r2;
					c2++;
					if(c2 > 7) {
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


function printMaze(maze) {
//var footrow="";
	for(var r = 0; r < maze.length; r++) {
		var row = maze[r];
		var headStr = "";
		var rowStr = "";
		var footrow = "";
		for(var c = 0; c < row.length; c++) {
			var here = " ";
			if(currLoc == row[c].nr){
				switch(currDir){
					case 'north':
						here = "^";
						break;
					case 'south':
						here = "v";
						break;
					case 'east':
						here = ">";
						break;
					case 'west':
						here = "<";
						break;
				}
			}

			footrow += "+----";
			if(r == 0){
				headStr += "+----";
			}else{
				headStr += (row[c].north == true && maze[r-1][c].south == true)?"+----":"+    ";
			}
			rowStr += (c == 0) ? "|" : "";
			rowStr += (row[c].dist > 9) ? here : " "+here;
			rowStr += row[c].dist;
			rowStr += (row[c].east==true && row[c+1].west==true )?" |":"  ";
			rowStr += (c == row.length - 1) ? "|" : "";
		}
		console.log(headStr + '+');
		console.log(rowStr);
	}
	console.log(footrow + '+');
}

initialMaze();
printMaze(testMaze);
