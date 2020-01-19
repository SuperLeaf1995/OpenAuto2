function Car(x,y,z,ct,d,rot,f) {
	this.carType = ct;
	this.sprite = new Sprite(d,carData[ct].skin,x,y,rot,z,f);
	this.movVel = 0;
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
