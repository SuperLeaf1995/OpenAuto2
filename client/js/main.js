//===========================================================
// VARIABLES, LOCALES AND CONSTANTS
//===========================================================

//var socket = io('https://openauto2.herokuapp.com/'); //create a new socket!
var socket = io('http://localhost:5000/');

const canvas = document.getElementById("canvas"); //assign the element of canvas
const display = canvas.getContext("2d",{alpha: true}); //set as a 2D canvas
canvas.width = 800; //define the real width and height of the canvas
canvas.height = 400;
var canvasHeight = canvas.height; //define the canvas size variables
var canvasWidth = canvas.width;
//set extra stuff to avoid some artifacts
display.mozImageSmoothingEnabled = false; display.webkitImageSmoothingEnabled = false;
display.msImageSmoothingEnabled = false; display.imageSmoothingEnabled = false;

var enterCar = false; //is player entering a car (transforming)
var imShooting = false; //is player shooting

var userData = {}; //<- player data
var carData = {}; //<- car sprites, data, stats, etc
var nodeData = {}; //<- npc paths
var bulletData = {}; //<- bullet stuff
var npc = {}; //<- npcs, nasty motherfuckers
var pedData = {}; //<- ped sprites, data, stats, etc
var localeData = {}; //<- language and names and stuff
var mapData = []; //<- data of city map
var keymapper = {}; //used to register keypresses
var id; //<- assigned socket id

var toIssue = 8; //the "issue" command

/*const cubeLines = [
					[0,1],[1,3],[3,2],[2,0], //top face
					[2,6],[3,7],[0,4],[1,5], //side faces
					[6,7],[6,4],[7,5],[4,5] //bottom face
				];
				
const cubeVertices = [
						[-1,-1,-1],
						[1,-1,-1],
						[-1,1,-1],
						[1,1,-1],
						[-1,-1,1],
						[1,-1,1],
						[-1,1,1],
						[1,1,1]
					];*/
var playerCameraX = (canvasWidth/2); //center X of camera
var playerCameraY = (canvasHeight/2); //center Y of camera
var viewField = canvasWidth*0.8; //field of view of the player camera
var tileSize = 48; //normal tilesize (for x, y and z)

var timer = 0;

var bulletSprt = new Image();
bulletSprt.src = "img/etc/bullet_generic.png";

bulletSprt.onload = function() {
	display.fillText("Loaded bullet sprites",0,0);
};

//===========================================================
// SUBFUNCTIONS
//===========================================================

//keyUp()
//set the key on keymapper as false (key is not being hold/pressed)
function keyUp(e) {
	var char = (String.fromCharCode(e.keyCode)).toLowerCase();
	keymapper[char] = false;
};

//keyDown()
//set the key on keymapper as true (key is being hold/pressed)
function keyDown(e) {
	var char = (String.fromCharCode(e.keyCode)).toLowerCase();
	keymapper[char] = true;
};

//resizeCanvas()
//resizes the CANVAS CONTENT, BUT NOT THE CANVAS!
function resizeCanvas() {
	let h = window.innerHeight;
	let w = window.innerWidth;

	canvas.style.width = w+'px';
	canvas.style.height = h+'px';

	canvasHeight = canvas.height;
	canvasWidth = canvas.width;
};

//sendMessage()
//sends a message to the server from the input box
function sendMessage() {
	let a = document.getElementById('chatbox');
	socket.emit('userSendMessage',a.value);
	a.value = "";
}

//window.setInterval:autoscroll
//scroll the chat each [specified]ms seconds
window.setInterval(function() {
	let e = document.getElementById('chat');
	e.scrollTop = e.scrollHeight;
},750); //autoscroll

//===========================================================
// EVENT LISTENERS
//===========================================================

//If the browser supports "addEventListener" use it!
if(window.addEventListener) {
	window.addEventListener('keyup',keyUp); //used on mozilla, chrome and safari
	window.addEventListener('keydown',keyDown);
	window.addEventListener('load',resizeCanvas);
	window.addEventListener('resize',resizeCanvas);
} else { //else use the old methods
	window.attachEvent('keyup',keyUp); //used on older browsers as ie 8 or below
	window.attachEvent('keydown',keyDown);
	window.attachEvent('load',resizeCanvas);
	window.attachEvent('resize',resizeCanvas);
}

//socket.on:connect
//Sets up the socket when it connects to the server (assigns the socket ID)
socket.on('connect',function() {
	console.log('Connection established');
	console.log('Assigned socket id: '+socket.io.engine.id);
	id = socket.io.engine.id;
});

//socket.on:npcUpdate
//Updates the npc
socket.on('npcUpdate',function(npc) {
	npcData = npc;
	for(let i in npcData) {
		if(npcData[i].isCar) {
			npcData[i].obj = new Car(npcData[i].x,npcData[i].y,npcData[i].z,npcData[i].carType,display,npcData[i].r,npcData[i].v,false);
		} else {
			npcData[i].ped = new Ped(npcData[i].x,npcData[i].y,npcData[i].z,npcData[i].pedType,display,npcData[i].r,npcData[i].v,false);
		}
	}
});

//socket.on:userReceiveData
//receives data from the server and stores it on the local data variables
socket.on('userReceiveData',function({mess,car,local,ped,npc,node}) {
	for(let i in mess) {
		let a = document.createElement('li'); //the li element
		let b = document.createTextNode(mess[i]); //content in li
		let c = document.getElementById('textland'); //where to put li
		a.appendChild(b); //appends text to li
		c.appendChild(a); //appends li to the chat div
		//c.scrollBy(0,50);
	}
	carData = car;
	pedData = ped;
	npcData = npc;
	for(let i in node) {
		node[i].x *= tileSize;
		node[i].y *= tileSize;
		node[i].x2 *= tileSize;
		node[i].y2 *= tileSize;
	}
	nodeData = node;
	//create new cars/peds for npcs
	for(let i in npcData) {
		if(npcData[i].isCar) {
			npcData[i].obj = new Car(npcData[i].x,npcData[i].y,npcData[i].z,npcData[i].carType,display,npcData[i].r,npcData[i].v,false);
		} else {
			npcData[i].ped = new Ped(npcData[i].x,npcData[i].y,npcData[i].z,npcData[i].pedType,display,npcData[i].r,npcData[i].v,false);
		}
	}
	//set the locale of the HTML elements text in the page
	var lang = window.navigator.userLanguage || window.navigator.language;
	localeData = local[lang]; //set appropiate locale
	console.log(lang);
	let i = document.getElementById('chatbox');
	i.placeholder = localeData.type;
	i = document.getElementById('sendButton');
	i.innerHTML = localeData.send;
});

//socket.on:userReceiveData
//receives data from the server and stores it on the local data variables
socket.on('userReceiveMap',function({i,i2,i3,data}) {
	if(mapData[i] === undefined) { mapData[i] = [] }
	if(mapData[i][i2] === undefined) { mapData[i][i2] = [] }
	if(mapData[i][i2][i3] === undefined) { mapData[i][i2][i3] = [] }
	mapData[i][i2][i3] = new MapTile(tileSize);
	mapData[i][i2][i3].setNewCoords(data.x,data.y,data.z);
});

//socket.on:userReceiveList
//receive the user list and create a new player object for each player
socket.on('userReceiveList',function(user) {
	userData = user; //the stuff  from user is now in our local thing
	for(let index in userData) {
		if(user[index].onFoot) {
			userData[index].ped = new Ped(userData[index].x,userData[index].y,userData[index].z,userData[index].pedType,display,userData[index].rot,userData[index].vel,false);
		} else if(!user[index].onFoot) {
			userData[index].obj = new Car(userData[index].x,userData[index].y,userData[index].z,userData[index].carType,display,userData[index].rot,userData[index].vel,false);
		}
	}
	if(user[id].onFoot) {
		userData[id].ped.sprite.focus = true; //its the main player, set camera focus on him
	} else {
		userData[id].obj.sprite.focus = true;
	}
});

//socket.on:userNew
//receives a new user from the server event, and registers it as a player object
socket.on('userNew',function(user) {
	userData[user.id] = user; //register new user
	//create new car object for that user
	if(user.onFoot) {
		userData[user.id].ped = new Ped(userData[user.id].x,userData[user.id].y,userData[user.id].z,userData[user.id].pedType,display,userData[user.id].rot,userData[user.id].vel,false);
	} else if(!user.onFoot) {
		userData[user.id].obj = new Car(userData[user.id].x,userData[user.id].y,userData[user.id].z,userData[user.id].carType,display,userData[user.id].rot,userData[user.id].vel,false);
	}
	if(user.id === id) {
		requestAnimationFrame(mainGame);
	}
});

//socket.on:userUpdate
//updates user variables and data on the specified user
socket.on('userUpdate',function(user) {
	//assign user data the received user
	userData[user.id] = user;
	//plot new stuff
	if(user.onFoot === true) {
		delete userData[user.id].obj;
		userData[user.id].ped = new Ped(userData[user.id].x,userData[user.id].y,userData[user.id].z,userData[user.id].pedType,display,userData[user.id].rot,userData[user.id].vel,false);
	} else {
		delete userData[user.id].ped;
		userData[user.id].obj = new Car(userData[user.id].x,userData[user.id].y,userData[user.id].z,userData[user.id].carType,display,userData[user.id].rot,userData[user.id].vel,false);
	}
});

//socket.on:userUpdateNickname
//updates the user nickname
socket.on('userUpdateNickname',function({nick,id}) {
	userData[id].nick = nick; //assign the new nickname
});

//socket.on:userDelete
//deletes the player out of the existence
socket.on('userDelete',function(i) {
	delete userData[i]; //delete specified user out of array shit
});

//socket.on:userSpreadMessage
//create a new li element in the chat log (basically print text in the chatbox)
socket.on('userSpreadMessage',function(msg) {
	let a = document.createElement('li'); //the li element
	let b = document.createTextNode(msg); //content in li
	let c = document.getElementById('textland'); //where to put li
	a.appendChild(b); //appends text to li
	c.appendChild(a); //appends li to the chat div
	//c.scrollBy(0,50);
});

socket.on('newBullet',function(data) {
	bulletData[Math.random()*100] = new Bullet(data.x,data.y,16,16,data.r,bulletSprt,display,data.sid);
});

function MapTile(radius) {
	this.radius = radius;
};

MapTile.prototype.project = function(x,y,z) {
	const sizeProjection = viewField/(viewField+z);
	const xProject = (x*sizeProjection)+playerCameraX;
	const yProject = (y*sizeProjection)+playerCameraY;
	return {
		size: sizeProjection,
		x: xProject,
		y: yProject
	}
};
MapTile.prototype.setNewCoords = function(x,y,z) {
	this.x = x;
	this.y = y;
	this.z = z;
};
MapTile.prototype.update = function(cameraX,cameraY,cameraZ) {
	let cubeX = ((-cameraX*5.5)+(canvasWidth/2))-(cameraZ*8)-this.x;
	let cubeY = ((-cameraY*5.5)+(canvasHeight/2))-(cameraZ*8)-this.y;
	let cubeZ = cameraZ;
	this.x = cubeX;
	this.y = cubeY;
	this.z = cubeZ;
	playerCameraX = (canvasWidth/2)-(tileSize/2);
	playerCameraY = (canvasHeight/2)-(tileSize/2);
};
MapTile.prototype.draw = function(d) {
	if(this.z < (-viewField + this.radius)) {
		return;
	}
	d.beginPath();
	for(let i in cubeLines) {
		const v1 = { //Draw all the cube lines
			x: this.x+(this.radius*cubeVertices[cubeLines[i][0]][0]),
			y: this.y+(this.radius*cubeVertices[cubeLines[i][0]][1]),
			z: this.z+(this.radius*cubeVertices[cubeLines[i][0]][2])
		};
		const v2 = {
			x: this.x+(this.radius*cubeVertices[cubeLines[i][1]][0]),
			y: this.y+(this.radius*cubeVertices[cubeLines[i][1]][1]),
			z: this.z+(this.radius*cubeVertices[cubeLines[i][1]][2])
		};
		const v1Project = this.project(v1.x,v1.y,v1.z);
		const v2Project = this.project(v2.x,v2.y,v2.z);
		d.moveTo(v1Project.x,v1Project.y);
		d.lineTo(v2Project.x,v2Project.y);
	};
	
	d.stroke();
	
	const v1 = {
		x: this.x+(this.radius*cubeVertices[0][0]),
		y: this.y+(this.radius*cubeVertices[0][1]),
		z: this.z+(this.radius*cubeVertices[0][2])
	};
	const v2 = {
		x: this.x+(this.radius*cubeVertices[7][0]),
		y: this.y+(this.radius*cubeVertices[7][1]),
		z: this.z+(this.radius*cubeVertices[7][2])
	};
	const v1Project = this.project(v1.x,v1.y,v1.z);
	const v2Project = this.project(v1.x,v1.y,v1.z);
};

function Bullet(x,y,w,h,rot,img,d,s) {
	this.p = [{x:-(w/2),y:-(h/2)},{x:w/2,y:-(h/2)},{x:w/2,y:h/2},{x:-(w/2),y:h/2}];
	this.o = [{x:-(w/2),y:-(h/2)},{x:w/2,y:-(h/2)},{x:w/2,y:h/2},{x:-(w/2),y:h/2}];
	this.angle = rot;
	this.zoom = 1;
	this.sid = s; //shooter
	this.x = x; this.y = y; this.w = w; this.h = h;
	this.img = img;
	this.display = d;
}

Bullet.prototype.update = function(steps) {
	//update
	this.x += Math.cos(this.angle)*steps;
	this.y += Math.sin(this.angle)*steps;
	//update
	var cAngle = Math.cos(this.angle);
	var sAngle = Math.sin(this.angle);
	for (var i = 0; i < this.o.length; i++) {
		this.p[i] = {
			x:(this.o[i].x*cAngle)-(this.o[i].y*sAngle)+this.x,
			y:(this.o[i].x*sAngle)+(this.o[i].y*cAngle)+this.y
		}
	}
	this.w = this.img.naturalWidth*this.zoom; this.h = this.img.naturalHeight*this.zoom;
	this.display.translate(this.x-userData[id].x+(canvasWidth/2)-(this.w/2),this.y-userData[id].y+(canvasHeight/2)-(this.h/2));
	this.display.rotate(this.angle); //rotate again
	this.display.drawImage(this.img,Math.floor(-this.w/2),Math.floor(-this.h/2),Math.floor(this.w),Math.floor(this.h)); //draws
	this.display.rotate(-this.angle); //set rotation to 0 (so everything dosent messes up)
	this.display.translate(-this.x+userData[id].x-(canvasWidth/2)+(this.w/2),-this.y+userData[id].y-(canvasHeight/2)+(this.h/2));
};

function BoundBox(x,y,w,h,rot) {	
	this.p = [{x:-(w/2),y:-(h/2)},{x:w/2,y:-(h/2)},{x:w/2,y:h/2},{x:-(w/2),y:h/2}];
	this.o = [{x:-(w/2),y:-(h/2)},{x:w/2,y:-(h/2)},{x:w/2,y:h/2},{x:-(w/2),y:h/2}];
	this.angle = rot;
	this.x = x; this.y = y; this.w = w; this.h = h;
};
BoundBox.prototype.collideWithNode = function(x,y) {
	//dosent collides with boundbox, collides with sprite!!
	if(this.x == x && this.y == y) {
		return true; //exactly on the "zero point"
	}
	//collides with boundbox?
	/*if(this.x-this.w > x && this.x+this.w < x
	&& this.y-this.h > y && this.y+this.h < y) {
		return true;
	}
	if(this.x+this.w > x && this.x-this.w < x
	&& this.y+this.h > y && this.y-this.h < y) {
		return true;
	}
	if(this.x+this.w > x && this.x+this.w < x
	&& this.y+this.h > y && this.y+this.h < y) {
		return true;
	}
	if(this.x-this.w > x && this.x-this.w < x
	&& this.y-this.h > y && this.y-this.h < y) {
		return true;
	}*/
	return false;
};
BoundBox.prototype.update = function() {
	var cAngle = Math.cos(this.angle);
	var sAngle = Math.sin(this.angle);
	for (var i = 0; i < this.o.length; i++) {
		this.p[i] = {
			x:(this.o[i].x*cAngle)-(this.o[i].y*sAngle)+this.x,
			y:(this.o[i].x*sAngle)+(this.o[i].y*cAngle)+this.y
		}
	}
	display.beginPath();
	display.moveTo(this.p[0].x-userData[id].x+(canvasWidth/2)-(this.w/2),this.p[0].y-userData[id].y+(canvasHeight/2)-(this.h/2));
	display.lineTo(this.p[1].x-userData[id].x+(canvasWidth/2)-(this.w/2),this.p[1].y-userData[id].y+(canvasHeight/2)-(this.h/2));
	display.lineTo(this.p[2].x-userData[id].x+(canvasWidth/2)-(this.w/2),this.p[2].y-userData[id].y+(canvasHeight/2)-(this.h/2));
	display.lineTo(this.p[3].x-userData[id].x+(canvasWidth/2)-(this.w/2),this.p[3].y-userData[id].y+(canvasHeight/2)-(this.h/2));
	display.lineTo(this.p[0].x-userData[id].x+(canvasWidth/2)-(this.w/2),this.p[0].y-userData[id].y+(canvasHeight/2)-(this.h/2));
	display.moveTo(this.x-userData[id].x+(canvasWidth/2)-(this.w/2),0);
	display.lineTo(this.x-userData[id].x+(canvasWidth/2)-(this.w/2),this.y-userData[id].y+(canvasHeight/2)-(this.h/2));
	display.moveTo(0,this.y-userData[id].y+(canvasHeight/2)-(this.h/2));
	display.lineTo(this.x-userData[id].x+(canvasWidth/2)-(this.w/2),this.y-userData[id].y+(canvasHeight/2)-(this.h/2));
	display.stroke();
};

function Sprite(d,src,x,y,rot,z,f) {
	this.display = d;
	this.img = new Image();
	this.img.src = src;
	this.zoom = z;
	this.focus = f;
	this.bb = new BoundBox(x,y,this.img.naturalWidth*this.zoom,this.img.naturalHeight*this.zoom,rot);
};
Sprite.prototype.move = function(steps) {
	// todo very do very | javidx convex polygons
	this.bb.x += Math.cos(this.bb.angle)*steps;
	this.bb.y += Math.sin(this.bb.angle)*steps;
};
Sprite.prototype.update = function() {
	if(this.bb.x-userData[id].x > canvasWidth
	|| this.bb.y-userData[id].y > canvasHeight) {
		//if its not in range, do not draw it
	} else {
		this.bb.update();//update the boundbox
		this.bb.w = this.img.naturalWidth*this.zoom; this.bb.h = this.img.naturalHeight*this.zoom;
	
		if(this.focus) {
			this.display.translate((canvasWidth/2)-(this.bb.w/2),(canvasHeight/2)-(this.bb.h/2));
		} else {
			this.display.translate(this.bb.x-userData[id].x+(canvasWidth/2)-(this.bb.w/2),this.bb.y-userData[id].y+(canvasHeight/2)-(this.bb.h/2));
		}
	
		this.display.rotate(this.bb.angle); //rotate again
		this.display.drawImage(this.img,Math.floor(-this.bb.w/2),Math.floor(-this.bb.h/2),Math.floor(this.bb.w),Math.floor(this.bb.h)); //draws
		this.display.rotate(-this.bb.angle); //set rotation to 0 (so everything dosent messes up)
		if(this.focus) {
			this.display.translate(-(canvasWidth/2)+(this.bb.w/2),-(canvasHeight/2)+(this.bb.h/2));
		} else {
			this.display.translate(-this.bb.x+userData[id].x-(canvasWidth/2)+(this.bb.w/2),-this.bb.y+userData[id].y-(canvasHeight/2)+(this.bb.h/2));
		}
	}
};

function Car(x,y,z,ct,d,rot,v,f) {
	this.carType = ct;
	this.sprite = new Sprite(d,carData[ct].skin,x,y,rot,z,f);
	this.movVel = v;
};

Car.prototype.update = function(issue) {
	if (issue === 0 || (issue === 4 || issue === 5)) { //w
		this.movVel >= carData[this.carType].movMax ? this.movVel = carData[this.carType].movMax : this.movVel += carData[this.carType].movStep;
	} if(issue === 1 || issue === 6 || issue === 7) { //s
		this.movVel <= -carData[this.carType].movMax ? this.movVel = -carData[this.carType].movMax : this.movVel -= carData[this.carType].movStep;
	} if((issue === 2 || issue === 4 || issue === 6) && this.movVel != 0) { //d
		this.sprite.bb.angle += this.movVel/140;
	} if((issue === 3 || issue === 5 || issue === 7) && this.movVel != 0) { //a
		this.sprite.bb.angle -= this.movVel/140;
	} if((issue === 2 || issue === 3 || issue === 8) && this.movVel > 0) { //no key pressed
		this.movVel -= carData[this.carType].movStep;
	} if((issue === 2 || issue === 3 || issue === 8) && this.movVel < 0) {
		this.movVel += carData[this.carType].movStep;
	}
	
	if((this.movVel > 0 && this.movVel < 0.1)
	|| (this.movVel < 0 && this.movVel > -0.1)) {
		this.movVel = 0;
	}
	
	this.sprite.move(this.movVel);
	this.sprite.update();
};

function Ped(x,y,z,ct,d,rot,v,f) {
	this.pedType = ct;
	this.sprite = new Sprite(d,pedData[ct].skin,x,y,rot,z,f);
	this.movVel = v;
};

Ped.prototype.update = function(issue) {
	if (issue === 0 || (issue === 4 || issue === 5)) { //w
		this.movVel >= pedData[this.pedType].movMax ? this.movVel = pedData[this.pedType].movMax : this.movVel += pedData[this.pedType].movStep;
	} if(issue === 1 || issue === 6 || issue === 7) { //s
		this.movVel <= -pedData[this.pedType].movMax ? this.movVel = -pedData[this.pedType].movMax : this.movVel -= pedData[this.pedType].movStep;
	} if((issue === 2 || issue === 4 || issue === 6)) { //d
		this.sprite.bb.angle += 0.1;
	} if((issue === 3 || issue === 5 || issue === 7)) { //a
		this.sprite.bb.angle -= 0.1;
	} if((issue === 2 || issue === 3 || issue === 8) && this.movVel > 0) { //no key pressed
		this.movVel = 0;
	} if((issue === 2 || issue === 3 || issue === 8) && this.movVel < 0) {
		this.movVel = 0;
	}
	
	if((this.movVel > 0 && this.movVel < 0.1)
	|| (this.movVel < 0 && this.movVel > -0.1)) {
		this.movVel = 0;
	}
	
	this.sprite.move(this.movVel);
	this.sprite.update();
};

//--------------------------
// MAIN GAME
//--------------------------

display.strokeStyle = 'black';

function mainGame() {
	if ((keymapper.w) && !(keymapper.a) && !(keymapper.d)) { userData[id].toIssue = 0; } //advance, no turn
	else if ((keymapper.s)  && !(keymapper.a) && !(keymapper.d)) { userData[id].toIssue = 1; } //backwards
	else if ((keymapper.d) && !(keymapper.w) && !(keymapper.s)) { userData[id].toIssue = 2; } //turn, no forward
	else if ((keymapper.a) && !(keymapper.w) && !(keymapper.s)) { userData[id].toIssue = 3; } //^
	else if ((keymapper.d) && (keymapper.w) && !(keymapper.s)) { userData[id].toIssue = 4; } //turn, forward
	else if ((keymapper.a) && (keymapper.w) && !(keymapper.s)) { userData[id].toIssue = 5; } //^
	else if ((keymapper.d) && (keymapper.s) && !(keymapper.w)) { userData[id].toIssue = 6; } //turn, backward
	else if ((keymapper.a) && (keymapper.s) && !(keymapper.w)) { userData[id].toIssue = 7; } //^
	else { userData[id].toIssue = 8; } //no key
	
	if(keymapper.z) { imShooting = true; }
	else { imShooting = false; }
	
	display.clearRect(0,0,canvasWidth,canvasHeight);
	
	if(imShooting) {
		//please dont hack!
		if(!userData[id].onFoot) {
			socket.emit('bulletShoot',{	x: (userData[id].obj.sprite.bb.x),
										y: (userData[id].obj.sprite.bb.y),
										r: userData[id].obj.sprite.bb.angle,
										sid: id});
		} else {
			socket.emit('bulletShoot',{	x: (userData[id].ped.sprite.bb.x),
										y: (userData[id].ped.sprite.bb.y),
										r: userData[id].ped.sprite.bb.angle,
										sid: id});
		}
	}
	
	for(let i in userData) {
		if(!userData[i].onFoot) { //if the user is in a car, use the coordinates of the car instead of the ped
			userData[i].x = userData[i].obj.sprite.bb.x;
			userData[i].y = userData[i].obj.sprite.bb.y;
			userData[i].w = userData[i].obj.sprite.bb.w;
			userData[i].h = userData[i].obj.sprite.bb.h;
			userData[i].rot = userData[i].obj.sprite.bb.angle;
			userData[i].vel = userData[i].obj.movVel;
		} else { //else use pedestrian coordinates
			userData[i].x = userData[i].ped.sprite.bb.x;
			userData[i].y = userData[i].ped.sprite.bb.y;
			userData[i].w = userData[i].ped.sprite.bb.w;
			userData[i].h = userData[i].ped.sprite.bb.h;
			userData[i].rot = userData[i].ped.sprite.bb.angle;
			userData[i].vel = userData[i].ped.movVel;
			//and check collisions
			for(let i2 in bulletData) {
				let f = userData[i].ped.sprite.bb.collideWithNode(bulletData[i2].x,bulletData[i2].y);
				if(f) {
					//die if touched by bullet
					userData[i].ped.health = 0;
					console.log(bulletData[i2]);
					socket.emit('userDead',{ id: i, //victim
											 sid: bulletData[i2].sid //killer
											 });
				}
			}
		}
	}
	
	/*for(let i in mapData) {
		for(let i2 in mapData[i]) {
			for(let i3 in mapData[i][i2]) {
				let a = tileSize*i;
				let b = tileSize*i2;
				
				mapData[i][i2][i3].setNewCoords(a,b,0);
				mapData[i][i2][i3].update((userData[id].x/6)-64,(userData[id].y/6)-104,1);
				mapData[i][i2][i3].draw(display);
			}
		}
	}*/
	
	for(let index in userData) {
		if(userData[index].onFoot) {
			userData[index].ped.update(userData[index].toIssue);
		} else {
			userData[index].obj.update(userData[index].toIssue);
		}
		display.fillText(userData[index].nick,userData[index].x-userData[id].x+(canvasWidth/2)-(userData[index].w/2),userData[index].y-userData[id].y+(canvasHeight/2)-(userData[index].h/2)-32);
		//draw arrows, well kind of...
		display.beginPath();
		display.moveTo((canvasWidth/2)-(userData[id].w/2),(canvasHeight/2)-(userData[id].h/2));
		display.lineTo(userData[index].x-userData[id].x+(canvasWidth/2)-(userData[index].w/2),userData[index].y-userData[id].y+(canvasHeight/2)-(userData[index].h/2));
		display.stroke();
	}
	
	for(let index in npcData) {
		if(!npcData[index].isCar) {
			npcData[index].ped.update(npcData[index].toIssue);
		} else {
			npcData[index].obj.update(npcData[index].toIssue);
		}
	}
	
	//update all bullets
	for(let index in bulletData) {
		bulletData[index].update(10);
	}
	
	display.beginPath();
	for(let i in nodeData) {
			display.moveTo(nodeData[i].x-userData[id].x+(canvasWidth/2),nodeData[i].y-userData[id].y+(canvasHeight/2));
			display.lineTo(nodeData[i].x2-userData[id].x+(canvasWidth/2),nodeData[i].y2-userData[id].y+(canvasHeight/2));
	}
	display.stroke();
	
	if(timer > 25) {
		socket.emit('userUpdate',userData[id]); //obligate the server to update
		timer = 0; //send them our new coordinates
	}
	
	timer++;
	requestAnimationFrame(mainGame);
}
