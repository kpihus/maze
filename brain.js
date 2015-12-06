var main = require('./start');
var whereTo = 0;
var path = [];

var brain = function(emitter) {
	var testMaze = require('./testMaze2.json');
	var self = this;
	self.testMode = false;
	var go;
	var maze = [];
	var X = 16;
	var Y = 16;
	var steps = 0;
	self.setGo = function(g) {
		go = g;
	};

	function initialMaze() {
		var cell = {
			nr: null,
			dist: 10,
			north: false,
			south: false,
			east: false,
			west: false
		};
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

	var checkWalls = function(callback) {
		go.readWalls(function(walldist) {
			var walls;
			switch(go.curDir){
				case 0:
					walls = {
						north: (walldist.front < 890),
						west: (walldist.left < 800),
						east: (walldist.right < 800),
						south: false
					};
					break;
				case 1:
					walls = {
						east: (walldist.front < 890),
						north: (walldist.left < 800),
						south: (walldist.right < 800),
						west: false
					};
					break;
				case 2:
					walls = {
						south: (walldist.front < 890),
						east: (walldist.left < 800),
						west: (walldist.right < 800),
						north: false
					};
					break;

				case 3:
					walls = {
						west: (walldist.front < 890),
						south: (walldist.left < 800),
						north: (walldist.right < 800),
						east: false
					};
					break;
			}


			console.log(walls); //TODO: Remove
			var cl = go.curLoc;
			maze[cl[0]][cl[1]].north = walls.north;
			if(cl[0] > 0) maze[cl[0] - 1][cl[1]].south = walls.north;
			maze[cl[0]][cl[1]].west = walls.west;
			if(cl[1] > 0) maze[cl[0]][cl[1] - 1].east = walls.west;
			maze[cl[0]][cl[1]].east = walls.east;
			if(cl[1] < X - 1) maze[cl[0]][cl[1] + 1].west = walls.east;
			maze[cl[0]][cl[1]].south = walls.south;
			if(cl[0] < X - 1) maze[cl[0] + 1][cl[1]].north = walls.south;
			callback(true);
		});
	};

	function calculate_distance(location, decideWhereTo) {
		var cl = go.curLoc;
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
			//main.log(wall);
			if((neighbours[i].dist <= bestNeighbour.dist) && (wall == false)) {
				if(decideWhereTo) {
					whereTo = i;
					var turnAmount = whereTo - go.curDir;
					if(turnAmount == 1 || turnAmount == -3) {
						go.turnTo = 1;
					} else if(turnAmount == -1 || turnAmount == 3) {
						go.turnTo = 3;
					} else if(turnAmount == -2 || turnAmount == 2) {
						go.turnTo = 2;
					}
				}
				bestNeighbour = neighbours[i];
			}
		}
		//set distance to cell in location.
		maze[location[0]][location[1]].dist = bestNeighbour.dist + 1;
		//callback(true);
	}

	var updateCells = function(callback) {
		var cl = go.curLoc;
		steps++;
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
			var coords2 = path[n];
			if(coords2[0] == cl[0] && coords2[1] == cl[1]) beenHere = true;
		}
		if(!beenHere) path.push([cl[0], cl[1]]);

		callback(true);
	};

	self.calc = function(callback) {
		main.log('do calc'); //TODO: Remove
		checkWalls(function(res) {
			if(res) {
				updateCells(function(res) {
					//printMaze(maze, go.curDir);
					callback(res);
				})
			}
		});
	};

	function printMaze(maze, dir) {
		var cl = go.curLoc;
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

};

exports.brain = brain;
