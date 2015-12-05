var main = require('./start.js');
var emitter = main.emmitter;
var legs = require('./legs.js');
var steps = 0;
var curWalls = main.curWalls;
var whereTo = 0;
var path = [];

var brain = function(emitter) {
	var self = this;
	var go;
	var maze = [];
	var cl = [15, 0];
	var X = 16;
	var Y = 16;
	var curDir = 0;
	var steps = 0;
	self.setGo = function(g) {
		go = g;
	};

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
						dist = c2 + r2;
						c2++;
						if(c2 > 7) {
							c2 = 0;
							r2++;
						}
					}
				}
				var newCell = JSON.parse(JSON.stringify(cell));
				newCell.nr = count++;
				newCell.dist = dist;
				maze[r].push(newCell);

			}//<- end of cell loop

		}
	}

	initialMaze();

	var worstNeighbour = {
		nr: null,
		dist: 100,
		north: false,
		south: false,
		east: false,
		west: false
	};

	var checkWalls = function() {
		go.readWalls(function(walls) {
			maze[cl[0]][cl[1]].north = walls.north;
			if(cl[0] > 0) maze[cl[0] - 1][cl[1]].south = walls.north;
			maze[cl[0]][cl[1]].west = walls.west;
			if(cl[1] > 0) maze[cl[0]][cl[1] - 1].east = walls.west;
			maze[cl[0]][cl[1]].east = walls.east;
			if(cl[1] < X - 1) maze[cl[0]][cl[1] + 1].west = walls.east;
			maze[cl[0]][cl[1]].south = walls.south;
			if(cl[0] < X - 1) maze[cl[0] + 1][cl[1]].north = walls.south;
		});
	};

	function calculate_distance(location, decideWhereTo) {
		var neighbours = [];
		var bestNeighbour = worstNeighbour;
		if(location[0] > 0) {
			neighbours.push(maze[location[0] - 1][location[1]])
		} else {
			neighbours.push(worstNeighbour);
		}
		if(location[1] < X - 1) {
			neighbours.push(maze[location[0]][location[1] + 1])
		} else {
			neighbours.push(worstNeighbour);
		}
		if(location[0] < X - 1) {
			neighbours.push(maze[location[0] + 1][location[1]])
		} else {
			neighbours.push(worstNeighbour);
		}
		if(location[1] > 0) {
			neighbours.push(maze[location[0]][location[1] - 1])
		} else {
			neighbours.push(worstNeighbour);
		}
		for(var i = 0; i < neighbours.length; i++) {
			var wall;
			switch(i) {
				case 0:
					wall = maze[location[0]][location[1]].north;
					break;
				case 1:
					wall = maze[location[0]][location[1]].east;
					break;
				case 2:
					wall = maze[location[0]][location[1]].south;
					break;
				case 3:
					wall = maze[location[0]][location[1]].west;
					break;
			}
			//console.log(wall);
			if((neighbours[i].dist <= bestNeighbour.dist) && (wall == false)) {
				if(decideWhereTo)whereTo = i;
				bestNeighbour = neighbours[i];
			}
		}
		//set distance to cell in location.
		maze[location[0]][location[1]].dist = bestNeighbour.dist + 1;
	}

	self.updateCells = function() {
		steps++;
		console.log("Step: " + steps);
		var stable = false;
		var currentDist;
		var currentPathDist;
		while(!stable) {
			stable = true;
			currentDist = maze[cl[0]][cl[1]].dist;

			//calculate distance for current location
			calculate_distance(cl, true);
			if(currentDist != maze[cl[0]][cl[1]].dist) stable = false;
			//update path distances
			for(var i = path.length - 1; i >= 0; i--) {
				var coords = path[i];
				currentPathDist = maze[coords[0]][coords[1]].dist;
				calculate_distance(path[i], false);
				if(currentPathDist != maze[coords[0]][coords[1]].dist) {
					stable = false;
				}
			}

		}

		var beenHere = false;
		for(var n = 0; n < path.length; n++) {
			var coords = path[n];
			if(coords[0] == cl[0] && coords[1] == cl[1]) beenHere = true;
		}
		if(!beenHere) path.push([cl[0], cl[1]]);
		//TODO: Probably not so good idea to make a turn here
		emitter.emit('turn', whereTo);
	}
};

exports.brain = brain;

emitter.on('set_walls', function() {
	emitter.emit('check_walls');
});

emitter.on('check_walls_done', function() {

	emitter.emit('set_walls_done');
});

emitter.on('calculate_distance', function(location, decideWhereTo) {
	var neighbours = [];
	var bestNeighbour = worstNeighbour;
	if(location[0] > 0) {
		neighbours.push(maze[location[0] - 1][location[1]])
	} else {
		neighbours.push(worstNeighbour);
	}
	if(location[1] < X - 1) {
		neighbours.push(maze[location[0]][location[1] + 1])
	} else {
		neighbours.push(worstNeighbour);
	}
	if(location[0] < X - 1) {
		neighbours.push(maze[location[0] + 1][location[1]])
	} else {
		neighbours.push(worstNeighbour);
	}
	if(location[1] > 0) {
		neighbours.push(maze[location[0]][location[1] - 1])
	} else {
		neighbours.push(worstNeighbour);
	}
	for(var i = 0; i < neighbours.length; i++) {
		var wall;
		switch(i) {
			case 0:
				wall = maze[location[0]][location[1]].north;
				break;
			case 1:
				wall = maze[location[0]][location[1]].east;
				break;
			case 2:
				wall = maze[location[0]][location[1]].south;
				break;
			case 3:
				wall = maze[location[0]][location[1]].west;
				break;
		}
		//console.log(wall);
		if((neighbours[i].dist <= bestNeighbour.dist) && (wall == false)) {
			if(decideWhereTo)whereTo = i;
			bestNeighbour = neighbours[i];
		}
	}
	//set distance to cell in location.
	maze[location[0]][location[1]].dist = bestNeighbour.dist + 1;
});

emitter.on('update_cells', function() {
	steps++;
	console.log("Step: " + steps);
	var stable = false;
	var currentDist;
	var currentPathDist;
	while(!stable) {
		stable = true;
		currentDist = maze[cl[0]][cl[1]].dist;

		//calculate distance for current location
		emitter.emit('calculate_distance', cl, true);
		if(currentDist != maze[cl[0]][cl[1]].dist) stable = false;

		//update path distances
		for(var i = path.length - 1; i >= 0; i--) {
			var coords = path[i];
			currentPathDist = maze[coords[0]][coords[1]].dist;
			emitter.emit('calculate_distance', path[i], false);

			if(currentPathDist != maze[coords[0]][coords[1]].dist) {
				stable = false;
			}
		}

	}

	var beenHere = false;
	for(var n = 0; n < path.length; n++) {
		var coords = path[n];
		if(coords[0] == cl[0] && coords[1] == cl[1]) beenHere = true;
	}
	if(!beenHere) path.push([cl[0], cl[1]]);

	emitter.emit('turn', whereTo);

});