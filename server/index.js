"use strict";

//include the libraries used for the webserver
const app = require('./app.js');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const fs = require('fs');

//the port number
const port = process.env.PORT || 5000;

var userData = {}; //user stuff, thats all
var npcData = {}; //npc stuff, identical to user data but no user controls em
var bulletData = {}; //everyone gangsta till the orange dot shows
var messages = {};
var messageCount = 0;

var serverSettings = JSON.parse(fs.readFileSync(path.normalize(__dirname+'/../server/config.json')));
var localeData = JSON.parse(fs.readFileSync(path.normalize(__dirname+'/../server/locale.json')));
var carData = JSON.parse(fs.readFileSync(path.normalize(__dirname+'/../server/cardata.json')));
var pedData = JSON.parse(fs.readFileSync(path.normalize(__dirname+'/../server/peddata.json')));
var mapData = JSON.parse(fs.readFileSync(path.normalize(__dirname+'/../server/mapdata.json')));

console.log('generating npcs');
for(let i = 0; i < serverSettings.maxNpc; i++) {
	npcData[i] = {
		x: Math.floor(Math.random()*420),
		y: Math.floor(Math.random()*420),
		z: 1,
		r: Math.floor(Math.random()*420),
		v: 0,
		isCar: false,
		carType: 0,
		pedType: 0,
		toIssue: 4,
		weapon: 1
	}
}

var mapNodeData = JSON.parse(fs.readFileSync(path.normalize(__dirname+'/../server/mapnode.json')));

app.get(path.normalize(__dirname+'/../client/'),function(req, res) {
	res.sendFile(path.normalize(__dirname+'/../client/index'));
});

http.listen(port, function() {
	console.log('listening on server:'+port);
});

/*
		"img/car/car00-01.png",
		"img/car/car00-02.png"
*/

io.on('connection', function(socket) {
	userData[socket.id] = {
		online: true, //boolean of status
		x: 0, //x coordinate
		y: 0, //y coordinate
		z: 1, //zoom
		id: socket.id, //send socket id
		rot: 0, //rotation is zero
		carType: 0, //will later change
		pedType: 0,
		vel: 0,
		money: 5000,
		toIssue: 8, //defaults to no key pressed
		nick: Math.floor(Math.random()*100),
		onFoot: true, //no one can spawn with a car, muahahaha!
		weapon: 1,
		killCount: 0
	}; //create new blank user struct
	//first, send the socket all needed data to start
	for(let i in mapData) {
		for(let i2 in mapData[i]) {
			for(let i3 in mapData[i][i2]) {
				socket.emit('userReceiveMap',{i: i,i2: i2,i3: i3,data: mapData[i][i2][i3]});
			}
		}
	}
	socket.emit('userReceiveData',{mess: messages,car: carData,local: localeData,ped: pedData,npc: npcData,node: mapNodeData});
	console.log(localeData);
	socket.emit('userReceiveList',userData); //send socket our current player stuff
	//emit to everyone the new socket
	io.emit('userNew',userData[socket.id]); //send everyone the socket information
	sendMessage(localeData[serverSettings.language].user+' '+userData[socket.id].nick+' '+localeData[serverSettings.language].connected,true);
	socket.on('disconnect', function() {
		sendMessage(localeData[serverSettings.language].user+' '+userData[socket.id].nick+' '+localeData[serverSettings.language].disconnected,true);
		delete userData[socket.id]; //delete from main database
		io.emit('userDelete',socket.id); //tell all sockets that this one is dead
	});
	
	socket.on('userUpdate', function(data) {
		userData[socket.id] = data;
		io.emit('userUpdate',userData[socket.id]); //give them our stuff
		io.emit('npcUpdate',npcData);
	});
	
	socket.on('userSendMessage', function(msg) { //they givin us they message
		sendMessage(msg,false);
	});
	
	socket.on('userDead', function(data) {
		console.log(data);
		sendMessage("User "+userData[data.id].nick+" killed by "+userData[data.sid].nick,true);
		userData[data.sid].killCount++; //give them a killcount
		if(userData[data.sid].killCount > 2) {
			sendMessage("User "+userData[data.sid].nick+" is on a "+userData[data.sid].killCount+" killstreak!",true);
		}
		//respawn at lobby!!!
		userData[data.id].x = 0;
		userData[data.id].y = 0;
		userData[data.id].z = 1;
		userData[data.id].r = 0;
		userData[data.id].vel = 0;
		userData[data.id].money -= 120;
		userData[data.id].health = 100;
	})
	
	socket.on('bulletShoot',function(data) {
		data.x += Math.cos(data.r)*40;
		data.y += Math.sin(data.r)*40;
		io.emit('newBullet',data);
	});
	
	function sendMessage(msg,server) {
		//check if message is empty
		if(msg === "") { return; }
		
		if(msg.startsWith(serverSettings.prefix)) {
			var args = msg.trim().split(" "); //split the message in arguments
			var cmd = args[0].slice(serverSettings.prefix.length); //take first argument (0) and remove the prefix
			switch(cmd) {
				case 'help':
					socket.emit('userSpreadMessage','== Help command ==');
					socket.emit('userSpreadMessage','help: displays help');
					socket.emit('userSpreadMessage','nick: sets a nick for the current socket');
					socket.emit('userSpreadMessage','uli: gets a list of users by socket id');
					socket.emit('userSpreadMessage','uln: gets a list of users by nickname');
					break;
				case 'nick':
					if(!args[1]) { return; }
					userData[socket.id].nick = args[1]; //assign the first argument after the nick
					break;
				case 'uli':
					var userString = "Users: ";
					for(let i in userData) {
						userString = userString+userData[i].id+' , ';
					}
					socket.emit('userSpreadMessage',userString);
					break;
				case 'uln':
					var userString = "Users: ";
					for(let i in userData) {
						userString = userString+userData[i].nick+' , ';
					}
					socket.emit('userSpreadMessage',userString);
					break;
				default:
					socket.emit('userSpreadMessage','invalid command issued'); //send ONLY to issuer socket that the command is invalid
					break;
			}
			return;
		}
		
		(server === true) ? msg = '['+localeData[serverSettings.language].server+']: '+msg : msg = '['+userData[socket.id].nick+']: '+msg;
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
	console.log('Shutdowning the HTTP server and SOCKETS server');
	io.close(); //close sockets
	http.close(); //close http server
});
