"use strict";

//include the libraries used for the webserver
const app = require('./app.js');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

//the port number
const port = process.env.PORT || 5000;

var userData = {};

app.get(path.normalize(__dirname+'/../client/'),function(req, res) {
	console.log('Sending requested index.html file via: '+req.method);
	res.sendFile(path.normalize(__dirname+'/../client/index'));
});

http.listen(port, function() {
	console.log('listening on server:'+port);
});

io.on('connection', function(socket) {
	let userStruct = {
		online: true, //boolean of status
		x: 0, //x coordinate
		y: 0, //y coordinate
		z: 0, //zoom
		id: socket.id, //send socket id
		rot: 0, //rotation is zero
		skin: 'img/car/car1.png', //default sprite for player car
		toIssue: 8 //defaults to no key pressed
	};
	
	userData[socket.id] = userStruct; //create new blank user struct
	
	console.log('User '+socket.id+' has connected'); //log new socket.id

	socket.emit('userReg',userData); //update all sockets
	io.emit('userSpreadMessage','[SERVER]:Socket '+socket.id+' connected');

	socket.on('disconnect', function() {
		delete userData[socket.id];
		console.log('User '+socket.id+' has disconnected'); //command log
		socket.emit('userDel',socket.id); //tell all sockets that this one is dead
		socket.emit('userReg',userData); //update all sockets
		io.emit('userSpreadMessage','[SERVER]:Socket '+socket.id+' disconnected');
	});
	
	socket.on('userUpdate', function(data) {
		userData[socket.id].obj = data.obj; //update our data
		userData[socket.id].x = data.obj.sprite.bb.x;
		userData[socket.id].y = data.obj.sprite.bb.y;
		userData[socket.id].z = data.obj.sprite.zoom;
		userData[socket.id].rot = data.obj.sprite.bb.angle;
		console.log(userData);
		socket.emit('userReg',userData); //give them our stuff
	});
	
	socket.on('userSendMessage', function(msg) { //they givin us they message
		console.log(socket.id+': '+msg);
		io.emit('userSpreadMessage','['+socket.id+']:'+msg); //lets spread it
	});
});
