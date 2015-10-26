var main = require('./start.js');
var emitter = main.emmitter;
var legs = require('./legs.js');
var maze = main.maze;
var X = main.X;
var Y = main.Y;
var cl = main.cl;
var currDir = main.currDir;
var checkWalls = legs.checkWalls;
var curWalls = main.curWalls;

var worstNeighbour = {
	nr: null,
	dist: 100,
	north: false,
	south: false,
	east: false,
	west: false
};

emitter.on('set_walls', function(){
	emitter.emit('check_walls');
	});

emitter.on('check_walls_done', function(){
	var walls = curWalls;
	maze[cl[0]][cl[1]].north = walls.north;
	if (cl[0]>0) maze[cl[0]-1][cl[1]].south = walls.north;
	maze[cl[0]][cl[1]].west = walls.west;
	if (cl[1]>0) maze[cl[0]][cl[1]-1].east = walls.west;
	maze[cl[0]][cl[1]].east = walls.east;
	if (cl[1]<X-1) maze[cl[0]][cl[1]+1].west = walls.east;
	maze[cl[0]][cl[1]].south = walls.south;
	if (cl[0]<X-1) maze[cl[0]+1][cl[1]].north = walls.south;
	emitter.emit('set_walls_done');
});

emitter.on('update_cells', function(){
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
		//console.log(wall);
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
		//console.log(wall);
		if ((neighbours[i].dist <= bestNeighbour.dist) && (wall == false)){

			bestNeighbour = neighbours[i];
			whereTo = i;
		}
	}
	//set distance to current location
	maze[cl[0]][cl[1]].dist = bestNeighbour.dist + 1;


	emitter.emit('turn', whereTo);


});