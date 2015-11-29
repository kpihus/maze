var intid;
var start = new Date().getTime();
intid = setInterval(function(){
	//console.log('Running');
}, 2);

setTimeout(function(){
	//console.log('STOP');
	setImmediate(clearInterval(intid));
	console.log('END', new Date().getTime() - start);
}, 500);