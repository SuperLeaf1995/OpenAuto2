"use strict";

//include the libraries used for the webserver
const app = require('./app.js');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

//the port number
const port = process.env.PORT || 3000;

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
		skin: 'img/car/car1.png' //default sprite for player car
	};
	userData[socket.id] = userStruct; //create new blank user struct
	
	console.log('User '+socket.id+' has connected'); //log new socket.id
	console.log(userData); //log current data structure
	socket.emit('userUpdate',userData); //on creation update

	socket.on('disconnect', function() {
		delete userData[socket.id];
		console.log('User '+socket.id+' has disconnected'); //command log
		socket.emit('userDel',socket.id); //tell all sockets that this one is dead
		socket.emit('userUpdate',userData); //update sockets
	});
});
