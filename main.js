//define the constants for the canvas and the 2d thing
const canvas = document.getElementById("canvas");
const display = canvas.getContext("2d");

//set canvas size depending on device wide and height
if(window.devicePixelRatio > 1) {
	canvas.width =  (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth)*2;
	canvas.height = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight)*2;
	display.scale(2,2);
}
else {
	canvas.width =  window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
}

//keymaps
var keymapper = {};
//limiters for cars
var movVel = 0; const movMax = 10; const movStep = 0.1;
//assign shortnames the size of the canvas
var canvasHeight = canvas.height;
var canvasWidth = canvas.width;
//shortnames for math stuff
var cos = Math.cos;
var sin = Math.sin;
//Used for cubes
const cube_amount = 1000;
const cube_radius = 2;
let projection_center_x = (canvasWidth/2);
let projection_center_y = (canvasHeight/2);
let field_of_view = canvasWidth * 0.8;
const cube_lines = [[0, 1], [1, 3], [3, 2], [2, 0], [2, 6], [3, 7], [0, 4], [1, 5], [6, 7], [6, 4], [7, 5], [4, 5]];
const cube_vertices = [[-1, -1, -1],[1, -1, -1],[-1, 1, -1],[1, 1, -1],[-1, -1, 1],[1, -1, 1],[-1, 1, 1],[1, 1, 1]];

var tileSize = 32;

//assets
//cuboid
var f;
var test = new MapTile(32); 
var carImg = new Image();
carImg.src = "img/car/car1.png";
carImg.onload = function(){
	f = new Sprite(display,this,100,100,0,1);
	requestAnimationFrame(mainGame);
};

//--------------------------
//Subfunctions
//--------------------------

//radian degrees
function DegreesToRadians(deg) {
	return deg*Math.PI/180;
}

function Line(x,y,x1,y1) {
	d.moveTo(x,y);
	d.lineTo(x1,y1);
	d.stroke();
}

//--------------------------
//Camera
//--------------------------
function Camera(x,y,z) {
	this.x = x;
	this.y = y;
	this.z = z;
};

Camera.prototype.setNewCoords = function(x,y,z) {
	this.x = x;
	this.y = y;
	this.z = z;
};

//--------------------------
//Tile
//--------------------------

function MapTile(radius) {
	this.radius = radius;
};

MapTile.prototype.project = function(x,y,z) {
	const sizeProjection = field_of_view / (field_of_view+z);
	const xProject = (x*sizeProjection)+projection_center_x;
	const yProject = (y*sizeProjection)+projection_center_y;
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
MapTile.prototype.setNew2DCoords = function(x,y) {
	this.x = x;
	this.y = y;
};
MapTile.prototype.update = function(cameraX,cameraY,cameraZ) {
	let cubeX = ((-cameraX*5.5)+(w/2))-(cameraZ*8)-this.x;
	let cubeY = ((-cameraY*5.5)+(h/2))-(cameraZ*8)-this.y;
	let cubeZ = tileSize*32;
	this.x = cubeX;
	this.y = cubeY;
	this.z = cubeZ;
	projection_center_x = (w/2)-(tileSize/2);
	projection_center_y = (h/2)-(tileSize/2);
};
MapTile.prototype.draw = function() {
	if(this.z < (-field_of_view + this.radius)) {
		return;
	}
	for(let i = 0; i < cube_lines.length; i++) {
		const v1 = { //Draw all the cube lines
			x: this.x + (this.radius * cube_vertices[cube_lines[i][0]][0]),
			y: this.y + (this.radius * cube_vertices[cube_lines[i][0]][1]),
			z: this.z + (this.radius * cube_vertices[cube_lines[i][0]][2])
		};
		const v2 = {
			x: this.x + (this.radius * cube_vertices[cube_lines[i][1]][0]),
			y: this.y + (this.radius * cube_vertices[cube_lines[i][1]][1]),
			z: this.z + (this.radius * cube_vertices[cube_lines[i][1]][2])
		};
		const v1Project = this.project(v1.x, v1.y, v1.z);
		const v2Project = this.project(v2.x, v2.y, v2.z);
		display.beginPath();
		display.moveTo(v1Project.x, v1Project.y);
		display.lineTo(v2Project.x, v2Project.y);
		display.stroke();
	}
};

//--------------------------
//Boundbox
//--------------------------

function BoundBox(x,y,w,h,rot) {	
	this.p = [{x:-(w/2), y:-(h/2)}, {x:w/2,y:-(h/2)}, {x:w/2,y:h/2}, {x:-(w/2),y:h/2}];
	this.o = [{x:-(w/2), y:-(h/2)}, {x:w/2,y:-(h/2)}, {x:w/2,y:h/2}, {x:-(w/2),y:h/2}];
	this.angle = rot;
	this.x = x; this.y = y; this.w = w; this.h = h;
};
BoundBox.prototype.collide = function(bb) {
	// body...
};
BoundBox.prototype.update = function() {
	var cAngle = cos(this.angle); var sAngle = sin(this.angle);
	for (var i = 0; i < this.o.length; i++) {
		this.p[i] = {
			x:(this.o[i].x * cAngle) - (this.o[i].y * sAngle) + this.x,
			y:(this.o[i].x * sAngle) + (this.o[i].y * cAngle) + this.y
		}
	}
};

//--------------------------
//Sprite
//--------------------------

function Sprite(display,image,x=50,y=50,rot=0,zoom=1) {
	this.display = display;
	this.img = image;
	this.zoom = zoom;
	this.bb = new BoundBox(x,y,image.naturalWidth*zoom,image.naturalHeight*zoom,rot);
};
Sprite.prototype.move = function(steps) {
	// todo very do very | javidx convex polygons
	this.bb.x += cos(this.bb.angle) * steps;
	this.bb.y += sin(this.bb.angle) * steps;
};
Sprite.prototype.update = function() {
	this.bb.update();
	this.bb.w = this.img.naturalWidth*this.zoom; this.bb.h = this.img.naturalHeight*this.zoom;
	this.display.translate(this.bb.x,this.bb.y);
	this.display.rotate(this.bb.angle);
	this.display.drawImage(this.img,(-this.bb.w/2),(-this.bb.h/2),this.bb.w,this.bb.h);
	this.display.rotate(-this.bb.angle);
	this.display.translate(-this.bb.x,-this.bb.y);
};

//--------------------------
//On( Event ) handlers
//--------------------------

window.onkeydown = function(e)
{
	var char = (String.fromCharCode(e.keyCode)).toLowerCase();
	keymapper[char] = true;
}
window.onkeyup = function(e)
{
	var char = (String.fromCharCode(e.keyCode)).toLowerCase();
	keymapper[char] = false;
}
//reply to a resize event
window.onresize = function resize() {
	//Browser was resized? No problem!, Just recalculate smh
	if(window.devicePixelRatio > 1) {
	c.width =  (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth)*2;
	c.height = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight)*2;
	display.scale(2,2);
	}
	else {
		c.width =  window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		c.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
	}
	//reset the shortnames
	canvasHeight = c.height;
	canvasWidth = c.width;
};

//--------------------------
//Main Game
//--------------------------

display.strokeStyle = "#00FF00";

function mainGame() {
	if (keymapper.w) {movVel >= movMax ? movVel = movMax :   movVel += movStep; }
	if (keymapper.s) {movVel <= -movMax ? movVel = -movMax : movVel -= movStep; }
	if (keymapper.d && movVel != 0) {f.bb.angle+=movVel/140; }
	if (keymapper.a && movVel != 0) {f.bb.angle-=movVel/140; }
	
	if (!(keymapper.s || keymapper.w) && movVel > 0) {movVel -= movStep} else
	if (!(keymapper.s || keymapper.w) && movVel < 0) {movVel += movStep};
	if (movVel > 0 && movVel < 0.1) {movVel = 0} 
	if (movVel < 0 && movVel > -0.1) {movVel = 0};
	
	f.move(movVel);

	display.clearRect(0,0,w,h);
	display.fillRect(0,0,w,h);
	
	display.beginPath();
	display.moveTo(f.bb.p[0].x,f.bb.p[0].y);
	display.lineTo(f.bb.p[1].x,f.bb.p[1].y);
	display.lineTo(f.bb.p[2].x,f.bb.p[2].y);
	display.lineTo(f.bb.p[3].x,f.bb.p[3].y);
	display.lineTo(f.bb.p[0].x,f.bb.p[0].y);

	display.moveTo(f.bb.x,0)
	display.lineTo(f.bb.x,f.bb.y);

	display.moveTo(0,f.bb.y)
	display.lineTo(f.bb.x,f.bb.y);

	display.stroke();
	
	test.setNewCoords(0,0,0);
	test.update(30,30,20);
	test.draw();
	
	f.update();

	requestAnimationFrame(bruh);
}
