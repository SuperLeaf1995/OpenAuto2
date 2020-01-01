function PedAI() {
	this.moveLeft = 0;
	this.moveRight = 0;
	this.moveUp = 0;
	this.moveDown = 0;
}

PedAI.prototype.wander = function() {
	this.moveLeft = Math.floor(Math.random()*2);
	this.moveRight = Math.floor(Math.random()*2);
	this.moveUp = Math.floor(Math.random()*2);
	this.moveDown = Math.floor(Math.random()*2);
	if(this.moveUp === 1 && this.moveDown === 1) {
		if(Math.floor(Math.random()*2) === 0) {
			this.moveDown = 0;
			this.moveUp = 1;
		} else {
			this.moveDown = 1;
			this.moveUp = 0;
		}
	}
	if(this.moveRight === 1 && this.moveLeft === 1) {
		if(Math.floor(Math.random()*2) === 0) {
			this.moveRight = 0;
			this.moveLeft = 1;
		} else {
			this.moveRight = 1;
			this.moveLeft = 0;
		}
	}
}

PedAI.prototype.goToPoint = function(x,y,data) {
	if(x > data.x) { /*If we are far from our stuff, just go for it!*/
		this.moveLeft = 1;
		this.moveRight = 0;
		this.moveUp = 1;
		this.moveDown = 0;
	}
	if(x < data.x) {
		this.moveLeft = 0;
		this.moveRight = 1;
		this.moveUp = 1;
		this.moveDown = 0;
	}
	if(y > data.y) {
		this.moveLeft = 0;
		this.moveRight = 0;
		this.moveUp = 1;
		this.moveDown = 1;
	}
	if(y < data.y) {
		this.moveLeft = 0;
		this.moveRight = 0;
		this.moveUp = 1;
		this.moveDown = 0;
	}
}
