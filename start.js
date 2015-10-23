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

var worstNeighbour = {
    nr: null,
    dist: 100,
    north: false,
    south: false,
    east: false,
    west: false
}

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
			var item=testMaze[cl[0]][cl[1]];
				return {
					north: item.north,
					south: item.south,
					east: item.east,
					west: item.west
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

function setWalls(){
    var walls = checkWalls();
    maze[cl[0]][cl[1]].north = walls.north;
    if (cl[0]>0) maze[cl[0]-1][cl[1]].south = walls.north;
    maze[cl[0]][cl[1]].west = walls.west;
    if (cl[1]>0) maze[cl[0]][cl[1]-1].east = walls.west;
    maze[cl[0]][cl[1]].east = walls.east;
    if (cl[1]<X-1) maze[cl[0]][cl[1]+1].west = walls.east;
    maze[cl[0]][cl[1]].south = walls.south;
    if (cl[0]<X-1) maze[cl[0]+1][cl[1]].north = walls.south;
}

function updateCells(){
    var neighbours = [];
    var northNeighbours = [];
    var eastNeighbours = [];
    var southNeighbours = [];
    var westNeighbours = [];

    if(cl[0]>0) {neighbours.push(maze[cl[0]-1][cl[1]])} else {neighbours.push(worstNeighbour);}
    if(cl[1]<X-1) {neighbours.push(maze[cl[0]][cl[1]+1])} else {neighbours.push(worstNeighbour);}
    if(cl[0]<X-1) {neighbours.push(maze[cl[0]+1][cl[1]])} else {neighbours.push(worstNeighbour);}
    if(cl[1]>0) {neighbours.push(maze[cl[0]][cl[1]-1])} else {neighbours.push(worstNeighbour);}


    //calculate distance for current location
    //console.log(neighbours);
    var bestNeighbour =  worstNeighbour;
    //var whereTo = 0;
    for (var i=0; i<neighbours.length; i++){
        var wall;
        switch(i){
            case 0:
                wall = maze[cl[0]][cl[1]].north;
                break;
            case 1:
                wall = maze[cl[0]][cl[1]].east;
                break;
            case 2:
                wall = maze[cl[0]][cl[1]].south;
                break;
            case 3:
                wall = maze[cl[0]][cl[1]].west;
                break;
        }
        console.log(wall);
        if ((neighbours[i].dist <= bestNeighbour.dist) && (wall == false)){

            bestNeighbour = neighbours[i];
        }
    }
    //set distance to current location
    maze[cl[0]][cl[1]].dist = bestNeighbour.dist + 1;

    //calculate distance of northern neighbour
    if(cl[0]>0) {
        //get neighbours of northern neighbour
        if(cl[0]>1) {northNeighbours.push(maze[cl[0]-2][cl[1]])} else {northNeighbours.push(worstNeighbour);}
        if(cl[1]<X-1) {northNeighbours.push(maze[cl[0]-1][cl[1]+1])} else {northNeighbours.push(worstNeighbour);}
        northNeighbours.push(maze[cl[0]][cl[1]]);
        if(cl[1]>0) {northNeighbours.push(maze[cl[0]-1][cl[1]-1])} else {northNeighbours.push(worstNeighbour);}

        //find the best neighbour
        var bestNeighbour = worstNeighbour;
        for (var i=0; i<northNeighbours.length; i++){
            var wall;
            switch(i){
                case 0:
                    wall = maze[cl[0]-1][cl[1]].north;
                    break;
                case 1:
                    wall = maze[cl[0]-1][cl[1]].east;
                    break;
                case 2:
                    wall = maze[cl[0]-1][cl[1]].south;
                    break;
                case 3:
                    wall = maze[cl[0]-1][cl[1]].west;
                    break;
            }
            if ((northNeighbours[i].dist < bestNeighbour.dist) && wall == false){
                bestNeighbour = northNeighbours[i];
            }
        }
        //set distance to northern neighbour
        //maze[cl[0]-1][cl[1]].dist = bestNeighbour.dist + 1;
        neighbours[0].dist = bestNeighbour.dist + 1;
    }

    //calculate distance of eastern neighbour
    if(cl[1]<X-1) {
        //get neighbours of eastern neighbour
        if(cl[0]>0) {eastNeighbours.push(maze[cl[0]-1][cl[1]+1])} else {eastNeighbours.push(worstNeighbour);}
        if(cl[1]<X-2) {eastNeighbours.push(maze[cl[0]][cl[1]+2])} else {eastNeighbours.push(worstNeighbour);}
        if(cl[0]<X-1) {eastNeighbours.push(maze[cl[0]+1][cl[1]+1])} else {eastNeighbours.push(worstNeighbour);}
        eastNeighbours.push(maze[cl[0]][cl[1]]);

        //find the best neighbour
        var bestNeighbour = worstNeighbour;
        for (var i=0; i<eastNeighbours.length; i++){
            var wall;
            switch(i){
                case 0:
                    wall = maze[cl[0]][cl[1]+1].north;
                    break;
                case 1:
                    wall = maze[cl[0]][cl[1]+1].east;
                    break;
                case 2:
                    wall = maze[cl[0]][cl[1]+1].south;
                    break;
                case 3:
                    wall = maze[cl[0]][cl[1]+1].west;
                    break;
            }
            if ((eastNeighbours[i].dist < bestNeighbour.dist) && wall == false){
                bestNeighbour = eastNeighbours[i];
            }
        }
        //set distance to eastern neighbour
        //maze[cl[0]][cl[1]+1].dist = bestNeighbour.dist + 1;
        neighbours[1].dist = bestNeighbour.dist + 1;
    }

    //calculate distance of southern neighbour
    if(cl[0]<X-1) {
        //get neighbours of southern neighbour
        southNeighbours.push(maze[cl[0]][cl[1]]);
        if(cl[1]<X-1) {southNeighbours.push(maze[cl[0]+1][cl[1]+1])} else {southNeighbours.push(worstNeighbour);}
        if(cl[0]<X-2) {southNeighbours.push(maze[cl[0]+2][cl[1]])} else {southNeighbours.push(worstNeighbour);}
        if(cl[1]>0) {southNeighbours.push(maze[cl[0]+1][cl[1]-1])} else {southNeighbours.push(worstNeighbour);}

        //find the best neighbour
        var bestNeighbour = worstNeighbour;
        for (var i=0; i<southNeighbours.length; i++){
            var wall;
            switch(i){
                case 0:
                    wall = maze[cl[0]+1][cl[1]].north;
                    break;
                case 1:
                    wall = maze[cl[0]+1][cl[1]].east;
                    break;
                case 2:
                    wall = maze[cl[0]+1][cl[1]].south;
                    break;
                case 3:
                    wall = maze[cl[0]+1][cl[1]].west;
                    break;
            }
            if ((southNeighbours[i].dist < bestNeighbour.dist) && wall == false){
                bestNeighbour = southNeighbours[i];
            }
        }
        //set distance to southern neighbour
        //maze[cl[0]+1][cl[1]].dist = bestNeighbour.dist + 1;
        neighbours[2].dist = bestNeighbour.dist + 1;
    }

    //calculate distance of western neighbour
    if(cl[1]>0) {
        //get neighbours of western neighbour

        if(cl[0]>0) {westNeighbours.push(maze[cl[0]-1][cl[1]-1])} else {westNeighbours.push(worstNeighbour);}
        westNeighbours.push(maze[cl[0]][cl[1]]);
        if(cl[0]<X-1) {westNeighbours.push(maze[cl[0]+1][cl[1]-1])} else {westNeighbours.push(worstNeighbour);}
        if(cl[1]>1) {westNeighbours.push(maze[cl[0]][cl[1]-2])} else {westNeighbours.push(worstNeighbour);}

        //find the best neighbour
        var bestNeighbour = worstNeighbour;
        for (var i=0; i<westNeighbours.length; i++){
            var wall;
            switch(i){
                case 0:
                    wall = maze[cl[0]][cl[1]-1].north;
                    break;
                case 1:
                    wall = maze[cl[0]][cl[1]-1].east;
                    break;
                case 2:
                    wall = maze[cl[0]][cl[1]-1].south;
                    break;
                case 3:
                    wall = maze[cl[0]][cl[1]-1].west;
                    break;
            }
            if ((westNeighbours[i].dist < bestNeighbour.dist) && wall == false){
                bestNeighbour = westNeighbours[i];
            }
        }
        //set distance to western neighbour
        //maze[cl[0]][cl[1]-1].dist = bestNeighbour.dist + 1;
        neighbours[3].dist = bestNeighbour.dist + 1;
    }

    //calculate distance for current location
    //console.log(neighbours);
    var bestNeighbour =  worstNeighbour;
    var whereTo = 0;
    for (var i=0; i<neighbours.length; i++){
        var wall;
        switch(i){
            case 0:
                wall = maze[cl[0]][cl[1]].north;
                break;
            case 1:
                wall = maze[cl[0]][cl[1]].east;
                break;
            case 2:
                wall = maze[cl[0]][cl[1]].south;
                break;
            case 3:
                wall = maze[cl[0]][cl[1]].west;
                break;
        }
        console.log(wall);
        if ((neighbours[i].dist <= bestNeighbour.dist) && (wall == false)){

            bestNeighbour = neighbours[i];
            whereTo = i;
        }
    }
    //set distance to current location
    maze[cl[0]][cl[1]].dist = bestNeighbour.dist + 1;

    printMaze(maze);
    turn(whereTo);
    moveForward();
}

initialMaze();
printMaze(testMaze);
printMaze(maze);

while (cl[0]<X/2-1 || cl[0]>X/2 || cl [1]<X/2-1 || cl[1] > X/2){
    setWalls();
    updateCells();
}
printMaze(maze);
