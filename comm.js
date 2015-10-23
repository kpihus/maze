/**
 * Created by kpihus on 20/10/15.
 */
var wifi = require('wifi-cc3000');
var ws = require('nodejs-websocket');
var port = 8000;
var wifiSettings = {
	ssid: 'tasuta',
	password: 'eioleolemas'
};

wifi.connect(wifiSettings, function(err, res){
	if(err){
		console.log(err); //TODO: Remove
	}
	console.log(res); //TODO: Remove
});

var server = ws.createServer(function(conn){
	console.log("New Connection"); //TODO: Remove
	conn.on('text', function(str){
		console.log('Received'+str); //TODO: Remove
	});
	conn.on('close', function(code, reason){
		console.log('Connection closed'); //TODO: Remove
	});
}).listen(port);
console.log('listeing on port',port); //TODO: Remove
var count = 0;
setInterval(function(){

	server.connections.forEach(function(conn){
		conn.sendText(JSON.stringify(maze));
	});
},1000);