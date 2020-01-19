"use strict";

//include the libraries used for the webserver
const app = require('./app.js');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const fs = require('fs');

//the port number
const port = process.env.PORT || 5000;

var userData = {};
var messages = {};
var messageCount = 0;

var serverSettings = JSON.parse(fs.readFileSync(path.normalize(__dirname+'/../server/config.json')));
var localeData = JSON.parse(fs.readFileSync(path.normalize(__dirname+'/../server/locale.json')));
var carData = JSON.parse(fs.readFileSync(path.normalize(__dirname+'/../server/cardata.json')));

app.get(path.normalize(__dirname+'/../client/'),function(req, res) {
	console.log('Sending requested index.html file via: '+req.method);
	res.sendFile(path.normalize(__dirname+'/../client/index'));
});

http.listen(port, function() {
	console.log('listening on server:'+port);
});

io.on('connection', function(socket) {
	userData[socket.id] = {
		online: true, //boolean of status
		x: 0, //x coordinate
		y: 0, //y coordinate
		z: 1, //zoom
		id: socket.id, //send socket id
		rot: 0, //rotation is zero
		carType: 1,
		toIssue: 8, //defaults to no key pressed
		nick: Math.floor(Math.random()*100)
	}; //create new blank user struct
	socket.emit('userReceiveChatHistory',messages);
	socket.emit('userReceiveCarData',carData);
	socket.emit('userReceiveLocale',localeData);
	socket.emit('userReg',userData); //update all sockets
	
	sendMessage(localeData[serverSettings.language].user+' '+userData[socket.id].nick+' '+localeData[serverSettings.language].connected,true);
	
	socket.on('disconnect', function() {
		sendMessage(localeData[serverSettings.language].user+' '+userData[socket.id].nick+' '+localeData[serverSettings.language].disconnected,true);

		delete userData[socket.id];

		io.emit('userDel',socket.id); //tell all sockets that this one is dead
		//socket.emit('userReg',userData); //update all sockets
	});
	
	socket.on('userUpdate', function(data) {
		userData[socket.id].obj = data.obj; //update our data
		userData[socket.id].x = data.obj.sprite.bb.x;
		userData[socket.id].y = data.obj.sprite.bb.y;
		userData[socket.id].z = data.obj.sprite.zoom;
		userData[socket.id].rot = data.obj.sprite.bb.angle;
		io.emit('userReg',userData); //give them our stuff
	});
	
	socket.on('userSendMessage', function(msg) { //they givin us they message
		sendMessage(msg,false);
	});
	
	function sendMessage(msg,server) {
		if(msg.match(/nick/i)) {
			msg = msg.slice(6);
			console.log('someone set their nick to '+msg);
			userData[socket.id].nick = msg;
			return;
		}
		(server === true) ? msg = '['+localeData[serverSettings.language].server+']:'+msg : msg = '['+userData[socket.id].nick+']:'+msg;
		io.emit('userSpreadMessage',msg); //lets spread it
		messages[messageCount] = msg;
		messageCount++;
		console.log(msg);
	}
});

process.once('SIGINT',function() {
	console.log('Shutdown signal received');
	console.log('Informing sockets of server closing');
	io.emit('userSpreadMessage','['+localeData[serverSettings.language].host+']: Server shutdown');
	console.log('Shutdowning the HTTP server');
	http.close();
});
