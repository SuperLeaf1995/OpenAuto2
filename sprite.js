console.log('Loading sprite.js');

cos = Math.cos;
sin = Math.sin;

function rad(deg) { return deg*Math.PI/180; }

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
		this.p[i] =
		{
			x:(this.o[i].x * cAngle) - (this.o[i].y * sAngle) + this.x,
			y:(this.o[i].x * sAngle) + (this.o[i].y * cAngle) + this.y
		}
	}
};

function Sprite(display,image,x,y,rot,zoom) {
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

Sprite.prototype.rotate = function(degree) {

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
