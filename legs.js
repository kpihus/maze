var main = require('./start.js');
var emitter = main.emmitter;
var testMaze = require('./testMaze2.json');
var cl = main.cl;
var currDir = main.currDir;
var isTessel = main.isTessel;
var curWalls = main.curWalls;
/*
 Moves forward by one cell
 And updates current location
 */
emitter.on('move_forward', function moveForward(){
	//TODO: add moving control here

	if(main.isTessel){
		tessel.led[0].toggle();
	}
	switch(main.getDir()){
		case 0:
			cl[0] = cl[0] - 1;
			break;
		case 1:
			cl[1] = cl[1] + 1;
			break;
		case 2:
			cl[0] = cl[0] + 1;
			break;
		case 3:
			cl[1] = cl[1] - 1;
			break;
	}

	if(isTessel){
		tessel.led[0].toggle();
	}
	if(!isTessel){
		//Dummy timeout to emulate moving for now
		setTimeout(function(){
			emitter.emit('moving_done');
		}, 50);
	} else{
		emitter.emit('moving_done');
	}
});

emitter.on('check_walls', function(){
	//TODO: dummy for now, data is taken from test Maze
	var item=testMaze[cl[0]][cl[1]];
		curWalls.north= item.north;
		curWalls.south= item.south;
		curWalls.east= item.east;
		curWalls.west= item.west;

	//TODO: emulate timeout for now
	setTimeout(function(){
		emitter.emit('check_walls_done');
	},100);


});

/*
 where: [
 0: north,
 1: east,
 2: south,
 3: west
 ]
 */
emitter.on('turn', function turn(where){
	var amount = (where -currDir)*90;
	//TODO: add turning control here
	main.setDir(where);
	setTimeout(function(){
		emitter.emit('turn_done');
	},50);


});
