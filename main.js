//define the constants for the canvas and the 2d thing
const c = document.getElementById("canvas");
const d = c.getContext("2d");

//set canvas size depending on device wide and height
if(window.devicePixelRatio > 1) {
	c.width =  (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth)*2;
	c.height = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight)*2;
	d.scale(2,2);
}
else {
	c.width =  window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	c.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
}

//assign shortnames the size of the canvas
var h = c.height;
var w = c.width;
//shortnames for math stuff
var cos = Math.cos;
var sin = Math.sin;

//--------------------------
//Subfunctions
//--------------------------

//radian degrees
function rad(deg) {
	return deg*Math.PI/180;
}

function line(x,y,x1,y1) {
	d.moveTo(x,y);
	d.lineTo(x1,y1);
	d.stroke();
}

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
MapTile.prototype.update = function() {
	let cubeX = ((-mainPlayer.x*5.5)+(canvasMainScreen.width/2))-(commonPlayerSize*8)-this.x;
	let cubeY = ((-mainPlayer.y*5.5)+(canvasMainScreen.height/2))-(commonPlayerSize*8)-this.y;
	let cubeZ = commonPlayerSize*32;
	this.x = cubeX;
	this.y = cubeY;
	this.z = cubeZ;
	projection_center_x = (canvasMainScreen.width/2)-(mainPlayer.width/2);
	projection_center_y = (canvasMainScreen.height/2)-(mainPlayer.height/2);
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
	this.d = display;
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
	this.d.translate(this.bb.x,this.bb.y);
	this.d.rotate(this.bb.angle);
	this.d.drawImage(this.img,(-this.bb.w/2),(-this.bb.h/2),this.bb.w,this.bb.h);
	this.d.rotate(-this.bb.angle);
	this.d.translate(-this.bb.x,-this.bb.y);
};

//--------------------------
//Main Game
//--------------------------

var f;
var carImg = new Image();
carImg.src = "img/car/car1.png";
carImg.onload = function(){
	f = new Sprite(d,this,100,100,0,1);
	requestAnimationFrame(bruh);
};
var keymapper = {};
var movVel = 0; const movMax = 10; const movStep = 0.1;

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
  h = c.height;
  w = c.width;
}

d.strokeStyle = "#FFFFFF";

function bruh() {
	if (keymapper.w) {movVel >= movMax ? movVel = movMax :   movVel += movStep; }
	if (keymapper.s) {movVel <= -movMax ? movVel = -movMax : movVel -= movStep; }
	if (keymapper.d && movVel != 0) {f.bb.angle+=movVel/140; }
	if (keymapper.a && movVel != 0) {f.bb.angle-=movVel/140; }
	
	if (!(keymapper.s || keymapper.w) && movVel > 0) {movVel -= movStep} else
	if (!(keymapper.s || keymapper.w) && movVel < 0) {movVel += movStep};
	if (movVel > 0 && movVel < 0.1) {movVel = 0} 
	if (movVel < 0 && movVel > -0.1) {movVel = 0};
	
	f.move(movVel);

	d.clearRect(0,0,w,h);
	d.fillRect(0,0,w,h);
	
	d.beginPath();
	d.moveTo(f.bb.p[0].x,f.bb.p[0].y);
	d.lineTo(f.bb.p[1].x,f.bb.p[1].y);
	d.lineTo(f.bb.p[2].x,f.bb.p[2].y);
	d.lineTo(f.bb.p[3].x,f.bb.p[3].y);
	d.lineTo(f.bb.p[0].x,f.bb.p[0].y);

	d.moveTo(f.bb.x,0)
	d.lineTo(f.bb.x,f.bb.y);

	d.moveTo(0,f.bb.y)
	d.lineTo(f.bb.x,f.bb.y);

	d.stroke();
	
	f.update();

	requestAnimationFrame(bruh);
}
