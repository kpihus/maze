var main = require('./start.js');
var emitter = main.emmitter;
var legs = require('./legs.js');
var steps = 0;
var maze = main.maze;
var X = main.X;
var Y = main.Y;
var cl = main.cl;
var currDir = main.currDir;
var checkWalls = legs.checkWalls;
var curWalls = main.curWalls;
var whereTo = 0;
var path = [];

var worstNeighbour = {
	nr: null,
	dist: 100,
	north: false,
	south: false,
	east: false,
	west: false
};

//var maze2 = function(emitter){
//
//};
//exports.maze = maze2;

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

emitter.on('calculate_distance', function(location, decideWhereTo){
    var neighbours = [];
    var bestNeighbour =  worstNeighbour;
    if(location[0]>0) {neighbours.push(maze[location[0]-1][location[1]])} else {neighbours.push(worstNeighbour);}
    if(location[1]<X-1) {neighbours.push(maze[location[0]][location[1]+1])} else {neighbours.push(worstNeighbour);}
    if(location[0]<X-1) {neighbours.push(maze[location[0]+1][location[1]])} else {neighbours.push(worstNeighbour);}
    if(location[1]>0) {neighbours.push(maze[location[0]][location[1]-1])} else {neighbours.push(worstNeighbour);}
    for (var i=0; i<neighbours.length; i++){
        var wall;
        switch(i){
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
        if ((neighbours[i].dist <= bestNeighbour.dist) && (wall == false)){
            if(decideWhereTo)whereTo = i;
            bestNeighbour = neighbours[i];
        }
    }
    //set distance to cell in location.
    maze[location[0]][location[1]].dist = bestNeighbour.dist + 1;
});

emitter.on('update_cells', function(){
    steps ++;
    console.log("Step: " + steps);
    var stable = false;
    var currentDist;
    var currentPathDist;
    while(!stable){
        stable = true;
        currentDist = maze[cl[0]][cl[1]].dist;

        //calculate distance for current location
        emitter.emit('calculate_distance', cl, true);
        if (currentDist != maze[cl[0]][cl[1]].dist) stable = false;

        //update path distances
        for(var i = path.length - 1; i >= 0; i--){
            var coords = path[i];
            currentPathDist = maze[coords[0]][coords[1]].dist;
            emitter.emit('calculate_distance', path[i], false);

            if (currentPathDist != maze[coords[0]][coords[1]].dist){
                stable = false;
            }
        }

    }

    var beenHere = false;
    for(var n = 0; n < path.length; n++){
        var coords = path[n];
        if(coords[0] == cl[0] && coords[1] == cl[1]) beenHere = true;
    }
    if(!beenHere) path.push([cl[0],cl[1]]);

	emitter.emit('turn', whereTo);


});