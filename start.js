console.log('Startup'); //TODO: Remove
try{
	var tessel = require('tessel');
	var isTessel = true;
}catch(e){
	var isTessel=false;
}


var maze = [];
var testMaze = require('./testMaze2.json');


var X = 16;
var Y = 16;
var cl = [15,0]; //Current location
var currDir =0;

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
	process.stdout.write('\033c');
//var footrow="";
	for(var r = 0; r < maze.length; r++) {
		var row = maze[r];
		var headStr = "";
		var rowStr = "";
		var footrow = "";
		for(var c = 0; c < row.length; c++) {
			var here = " ";
			if(cl[0] == r && cl[1]==c ){
				switch(currDir){
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

function checkWalls(){
	//TODO: dummy for now, data is taken from test Maze
	for(var r=0; r<testMaze.length; r++){
		var row = testMaze[r];
		for(var c=0; c<row.length; c++){
			var item=row[c];
			if(item.nr==cl){
				return {
					north: item.north,
					south: item.south,
					east: item.east,
					west: item.west
				}
			}
		}
	}
}
/*
Moves forward by one cell
And updates current location
 */
function moveForward(){
	//TODO: add moving control here
	//Dummy timeout to emulate moving for now
	console.log('Moving forward ...');
	if(isTessel){
		tessel.led[0].toggle();
	}

		switch(currDir){
			case 0:
				cl[0]=cl[0]-1;
				break;
			case 1:
				cl[1]=cl[1]+1;
				break;
			case 2:
				cl[0]=cl[0]+1;
				break;
			case 3:
				cl[1]=cl[1]-1;
				break;
		}

	if(isTessel){
		tessel.led[0].toggle();
	}
	return true;
}

/*
where: [
0: north,
1: east,
2: south,
3: west
]
 */
function turn(where){
 var amount = (where -currDir)*90;
	//TODO: add turning control here
	currDir=where;
	return true;
}

initialMaze();
printMaze(testMaze);




