//define the constants for the canvas and the 2d thing
const canvas = document.getElementById("canvas");
const display = canvas.getContext("2d");
//define the real widht and height of the canvas
canvas.width = 800;
canvas.height = 400;
//define the canvas size variables
var canvasHeight;
var canvasWidth;

//used for cube and maptile calculations
const cube_radius = 2;
let projection_center_x = (canvasWidth/2);
let projection_center_y = (canvasHeight/2);
let field_of_view = canvasWidth * 0.8;
const cube_lines = [[0,1],[1,3],[3,2],[2,0],[2,6],[3,7],[0,4],[1,5],[6,7],[6,4],[7,5],[4,5]];
const cube_vertices = [[-1,-1,-1],[1,-1,-1],[-1,1,-1],[1,1,-1],[-1,-1,1],[1,-1,1],[-1,1,1],[1,1,1]];
var tileSize = 32; //size of tile

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

//--------------------------
//Camera
//--------------------------
function Camera(x,y,z) {
	this.x = x;
	this.y = y;
	this.zoom = z;
};
Camera.prototype.setNewCoords = function(x,y,z) {
	this.x = x;
	this.y = y;
	this.zoom = z;
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
MapTile.prototype.draw = function(d) {
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
		d.beginPath();
		d.moveTo(v1Project.x, v1Project.y);
		d.lineTo(v2Project.x, v2Project.y);
		d.stroke();
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
	
	this.oldX = this.x;
	this.oldY = this.y;
	this.oldAngle = this.angle;
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
BoundBox.prototype.drawBoundBox = function(d) {
	d.beginPath();
	
	//draw the box of the boundary box
	d.moveTo(this.p[0].x,this.p[0].y);
	d.lineTo(this.p[1].x,this.p[1].y);
	d.lineTo(this.p[2].x,this.p[2].y);
	d.lineTo(this.p[3].x,this.p[3].y);
	d.lineTo(this.p[0].x,this.p[0].y);
	
	//angle-ignoring lines that overmarks where the boundbox is
	d.moveTo(this.x,0); //x
	d.lineTo(this.x,this.y);
	d.moveTo(0,this.y); //y
	d.lineTo(this.x,this.y);
	//lines marked from the other side
	d.moveTo(this.x,canvasHeight);
	d.lineTo(this.x,this.y);
	d.moveTo(canvasWidth,this.y);
	d.lineTo(this.x,this.y);
	
	display.stroke();
};

//--------------------------
//Sprite
//--------------------------

function Sprite(display,image,x,y,rot,cam,focus) {
	this.display = display;
	this.img = image;
	this.zoom = cam.zoom;
	this.cam = cam;
	this.focus = focus;
	this.bb = new BoundBox(x,y,image.naturalWidth*this.zoom,image.naturalHeight*this.zoom,rot,cam);
};
Sprite.prototype.move = function(steps) {
	// todo very do very | javidx convex polygons
	this.bb.x += cos(this.bb.angle) * steps;
	this.bb.y += sin(this.bb.angle) * steps;
};
Sprite.prototype.update = function() {
	this.zoom = this.cam.zoom;
	this.bb.update();
	this.bb.w = this.img.naturalWidth*this.zoom; this.bb.h = this.img.naturalHeight*this.zoom;
	this.display.translate(this.bb.x,this.bb.y);
	this.display.rotate(this.bb.angle);
	this.display.drawImage(this.img,(-this.bb.w/2),(-this.bb.h/2),this.bb.w,this.bb.h);
	this.display.rotate(-this.bb.angle);
	this.display.translate(-this.bb.x,-this.bb.y);
};
