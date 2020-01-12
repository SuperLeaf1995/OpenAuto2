var socket = io('http://localhost:3000/'); //create a new socket!

//limiters for cars
const movMax = 10;
const movStep = 0.1;

var mainCamera = new Camera(0,0,1);
var userData = {};
var id;

socket.on('connect',function() {
	console.log('Connection established');
	console.log('Assigned socket id: '+socket.io.engine.id);
	id = socket.io.engine.id;
	display.fillStyle = 'black';
});

socket.on('userReg',function(user) {
	userData = user; //the stuff  from user is now in our local thing
	console.log(userData);
	for(let index in userData) {
		delete userData[index].obj;
		userData[index].obj = new Car(userData[index].x,userData[index].y,userData[index].z,userData[index].skin,display,mainCamera,false,userData[index].rot);
	}
	requestAnimationFrame(mainGame);
});

socket.on('userDel',function(i) {
	console.log('Delete user');
	delete userData[i]; //delete specified user out of array shit
});

function Car(x,y,z,src,d,cam,f,rot) {
	this.focus = f;
	this.usedCam = cam;
	this.img = new Image();
	this.img.src = src;
	this.display = d;
	this.sprite = new Sprite(d,this.img,x,y,rot,this.usedCam,this.focus);
	this.movVel = 0;
};

Car.prototype.update = function(issue) {
	if (issue === 0 || (issue === 4 || issue === 5)) { //w
		this.movVel >= movMax ? this.movVel = movMax : this.movVel += movStep;
	} if (issue === 1 || issue === 6 || issue === 7) { //s
		this.movVel <= -movMax ? this.movVel = -movMax : this.movVel -= movStep;
	} if ((issue === 2 || issue === 4 || issue === 6) && this.movVel != 0) { //d
		this.sprite.bb.angle += this.movVel/140;
	} if ((issue === 3 || issue === 5 || issue === 7) && this.movVel != 0) { //a
		this.sprite.bb.angle -= this.movVel/140;
	} if (!(issue === 0 || issue === 1 || issue === 4 || issue === 5 || issue === 6 || issue === 7) && this.movVel > 0) { //no key pressed
		this.movVel -= movStep
	} if (!(issue === 0 || issue === 1 || issue === 4 || issue === 5 || issue === 6 || issue === 7) && this.movVel < 0) {
		this.movVel += movStep
	}
	
	if (this.movVel > 0 && this.movVel < 0.1) {
		this.movVel = 0
	}
	if (this.movVel < 0 && this.movVel > -0.1) {
		this.movVel = 0
	}
	
	this.sprite.move(this.movVel);
	this.sprite.update();
};

//--------------------------
//Main Game
//--------------------------

var toIssue;

function mainGame() {
	if (keymapper.w && !(keymapper.a) && !(keymapper.d)) { userData[id].toIssue = 0; } //advance, no turn
	else if (keymapper.s  && !(keymapper.a) && !(keymapper.d)) { userData[id].toIssue = 1; } //backwards
	else if (keymapper.d && !(keymapper.w) && !(keymapper.s)) { userData[id].toIssue = 2; } //turn, no forward
	else if (keymapper.a && !(keymapper.w) && !(keymapper.s)) { userData[id].toIssue = 3; } //^
	else if (keymapper.d && keymapper.w && !(keymapper.s)) { userData[id].toIssue = 4; } //turn, forward
	else if (keymapper.a && keymapper.w && !(keymapper.s)) { userData[id].toIssue = 5; } //^
	else if (keymapper.d && keymapper.s && !(keymapper.w)) { userData[id].toIssue = 6; } //turn, backward
	else if (keymapper.a && keymapper.s && !(keymapper.w)) { userData[id].toIssue = 7; } //^
	else { userData[id].toIssue = 8; } //no key
	
	//display.clearRect(0,0,canvasWidth,canvasHeight);
	display.fillRect(0,0,canvasWidth,canvasHeight);
	
	if(Math.random() < 0.05) {
		socket.emit('userUpdate',userData[id]); //send them our new coordinates
	}

	for(let index in userData) {
		userData[index].obj.update(userData[index].toIssue);
	}
	
	userData[id].toIssue = 8;
	requestAnimationFrame(mainGame);
}
