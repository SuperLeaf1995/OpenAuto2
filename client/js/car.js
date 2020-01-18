//limiters for cars
const movMax = 10;
const movStep = 0.1;

function Car(x,y,z,ct,d,rot) {
	this.img = new Image();
	this.img.src = carData[ct].skin;
	this.sprite = new Sprite(d,this.img,x,y,rot,z);
	this.movVel = 0;
};

Car.prototype.update = function(issue) {
	if (issue === 0 || (issue === 4 || issue === 5)) { //w
		this.movVel >= movMax ? this.movVel = movMax : this.movVel += movStep;
	} if(issue === 1 || issue === 6 || issue === 7) { //s
		this.movVel <= -movMax ? this.movVel = -movMax : this.movVel -= movStep;
	} if((issue === 2 || issue === 4 || issue === 6) && this.movVel != 0) { //d
		this.sprite.bb.angle += this.movVel/140;
	} if((issue === 3 || issue === 5 || issue === 7) && this.movVel != 0) { //a
		this.sprite.bb.angle -= this.movVel/140;
	} if((issue === 2 || issue === 3 || issue === 8) && this.movVel > 0) { //no key pressed
		this.movVel -= movStep;
	} if((issue === 2 || issue === 3 || issue === 8) && this.movVel < 0) {
		this.movVel += movStep;
	}
	
	if(this.movVel > 0 && this.movVel < 0.1) {
		this.movVel = 0
	}
	if(this.movVel < 0 && this.movVel > -0.1) {
		this.movVel = 0
	}
	
	this.sprite.move(this.movVel);
	this.sprite.update();
};
