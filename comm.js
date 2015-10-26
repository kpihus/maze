/**
 * Created by kpihus on 20/10/15.
 */

var ws = require('nodejs-websocket');
var main = require('./start.js');
var emitter = main.emmitter;
var port = 8000;
var wifiSettings = {
	ssid: 'tessel',
	password: 'tesselnet'
};
console.log('Comm start...');

if(main.isTessel){
	var wifi = require('wifi-cc3000');
	wifi.connect(wifiSettings, function(err, res){
		if(err){
			console.log(err); //TODO: Remove
		}
		console.log(res.ip); //TODO: Remove
	});
}

var server = ws.createServer(function(conn){
	console.log("New Connection"); //TODO: Remove
	conn.on('text', function(str){
		console.log('Received' + str); //TODO: Remove
	});
	conn.on('close', function(code, reason){
		console.log('Connection closed'); //TODO: Remove
	});
}).listen(port);
console.log('listeing on port', port); //TODO: Remove


emitter.on('send_data', function(){
	server.connections.forEach(function(conn){
		conn.sendText(JSON.stringify(main.maze));
	});
});
