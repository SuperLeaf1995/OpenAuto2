//define the constants for the canvas and the 2d thing
const canvas = document.getElementById("canvas");
const display = canvas.getContext("2d");

canvas.width = 640;
canvas.height = 400;

var canvasHeight;
var canvasWidth;

//shortnames for math stuff
var cos = Math.cos;
var sin = Math.sin;

//--------------------------
//Subfunctions
//--------------------------

//radian degrees
function DegreesToRadians(deg) {
	return deg*Math.PI/180;
}

function resizeCanvas() {
	let h = window.innerHeight;
	let r = canvas.width/canvas.height;
	let w = h*r;

	canvas.style.width = w+'px';
	canvas.style.height = h+'px';

	canvasHeight = canvas.height;
	canvasWidth = canvas.width;
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
MapTile.prototype.update = function(cameraX,cameraY,cameraZ) {
	let cubeX = ((-cameraX*5.5)+(canvasWidth/2))-(cameraZ*8)-this.x;
	let cubeY = ((-cameraY*5.5)+(canvasHeight/2))-(cameraZ*8)-this.y;
	let cubeZ = tileSize*32;
	this.x = cubeX;
	this.y = cubeY;
	this.z = cubeZ;
	projection_center_x = (canvasWidth/2)-(tileSize/2);
	projection_center_y = (canvasHeight/2)-(tileSize/2);
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
//On(event)
//--------------------------

window.addEventListener('load',resizeCanvas,false);
window.addEventListener('resize',resizeCanvas,false);