console.log('Loading index.js');

carImg.onload = function() {
	for(let i = 0; i < onScreenGeneratedPedestrians; i++) {
		cars[i] = new Sprite(d,this,100,100,0,1);
		movementVelocity[i] = 0;
	}
	for(let i = 0; i < onScreenGeneratedPedestrians-1; i++) {
		pedestrian[i] = new PedAI();
		cars[i].focus = false; //we dont want to see them!
	}
	cars[0].focus = true; //our player!
	/*f2 = new Sprite(d,this,150,100,45,0.4);
	f3 = new Sprite(d,this,200,100,15,1);
	f4 = new Sprite(d,this,250,100,200,0.7);*/
	console.log('Initalized canvas ' + c.width + "x" + c.height);
	play(sfx_car_starting);
	setTimeout(sfx_car_starting.duration);
	stop(sfx_car_starting);
	requestAnimationFrame(mainGameLoop);
};

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

function mainGameLoop() {
	if (keymapper.w) {movementVelocity[0] >= movMax ? movementVelocity[0] = movMax :   movementVelocity[0] += movStep; }
	if (keymapper.s) {movementVelocity[0] <= -movementNegativeMax ? movementVelocity[0] = -movementNegativeMax : movementVelocity[0] -= movStep; direction = 0; }
	if (keymapper.d && movementVelocity[0] != 0) { cars[0].bb.angle+=movementVelocity[0]/movBrakeCurvePenalty; direction = 1; }
	if (keymapper.a && movementVelocity[0] != 0) { cars[0].bb.angle-=movementVelocity[0]/movBrakeCurvePenalty; }
	
	if (!(keymapper.s || keymapper.w) && movementVelocity[0] > 0) {movementVelocity[0] -= movStep} else
	if (!(keymapper.s || keymapper.w) && movementVelocity[0] < 0) {movementVelocity[0] += movStep};
	if (movementVelocity[0] > 0 && movementVelocity[0] < movementVelocityChange) {movementVelocity[0] = 0} 
	if (movementVelocity[0] < 0 && movementVelocity[0] > -movementVelocityChange) {movementVelocity[0] = 0};
	
	for(let i = 0; i < onScreenGeneratedPedestrians-1; i++) {
		//pedestrian[i].wander();
		pedestrian[i].goToPoint(817,586,cars[i+1]);
	}
	
	//AI's form of moving!
	for(let i = 0; i < onScreenGeneratedPedestrians-1; i++) {
		if (pedestrian[i].moveUp  === 1) {movementVelocity[i+1] >= movMax ? movementVelocity[i+1] = movMax :   movementVelocity[i+1] += movStep; }
		if (pedestrian[i].moveDown === 1) {movementVelocity[i+1] <= -movementNegativeMax ? movementVelocity[i+1] = -movementNegativeMax : movementVelocity[i+1] -= movStep; direction = 0; }
		if (pedestrian[i].moveRight === 1 && movementVelocity[i+1] != 0) { cars[i].bb.angle+=movementVelocity[i+1]/movBrakeCurvePenalty; direction = 1; }
		if (pedestrian[i].moveLeft === 1 && movementVelocity[i+1] != 0) { cars[i].bb.angle-=movementVelocity[i+1]/movBrakeCurvePenalty; }
	
		if (!(pedestrian[i].moveDown === 1 || pedestrian[i].moveUp === 1) && movementVelocity[i+1] > 0) {movementVelocity[i+1] -= movStep} else
		if (!(pedestrian[i].moveDown === 1 || pedestrian[i].moveUp === 1) && movementVelocity[i+1] < 0) {movementVelocity[i+1] += movStep};
		if (movementVelocity[i+1] > 0 && movementVelocity[i+1] < movementVelocityChange) {movementVelocity[i+1] = 0} 
		if (movementVelocity[i+1] < 0 && movementVelocity[i+1] > -movementVelocityChange) {movementVelocity[i+1] = 0};
	}
	
	//Make sounds
	for(let i = 0; i < onScreenGeneratedPedestrians; i++) {
		if(movementVelocity[i] >= 0) {
			carGoing = 1;
		} else if(movementVelocity[i] < 0) {
			carGoing = -1;
		} else {
			carGoing = 0;
		}
	}

	for(let i = 0; i < onScreenGeneratedPedestrians; i++) {
		cars[i].move(movementVelocity[i]);
	}
	
	//Time to draw
	d.clearRect(0,0,c.width,c.height);
	d.fillRect(0,0,c.width,c.height);
	
	//stop cars from exiting
	for(let i = 0; i < onScreenGeneratedPedestrians; i++) {
		if(cars[i].bb.x < 0) { cars[i].bb.x = 0; movementVelocity[i] = 0; } /*On collide, set velocity to 0*/
		if(cars[i].bb.y < 0+(cars[i].bb.h/2)) { cars[i].bb.y = 0+(cars[i].bb.h/2); movementVelocity[i] = 0; }
		if(cars[i].bb.x > (c.width)-(cars[i].bb.w/2)) { cars[i].bb.x = c.width-(cars[i].bb.w/2); movementVelocity[i] = 0; }
		if(cars[i].bb.y > (c.height)-cars[i].bb.h) { cars[i].bb.y = c.height-cars[i].bb.h; movementVelocity[i] = 0; }
	}
	
	for(let i = 0; i < onScreenGeneratedPedestrians; i++) {
		d.beginPath();
		d.fillStyle = "blue";
		d.moveTo(cars[i].bb.p[0].x,cars[i].bb.p[0].y);
		d.lineTo(cars[i].bb.p[1].x,cars[i].bb.p[1].y);
		d.lineTo(cars[i].bb.p[2].x,cars[i].bb.p[2].y);
		d.lineTo(cars[i].bb.p[3].x,cars[i].bb.p[3].y);
		d.lineTo(cars[i].bb.p[0].x,cars[i].bb.p[0].y);
		
		d.fillStyle = "white";
	
		d.moveTo(cars[i].bb.x,0)
		d.lineTo(cars[i].bb.x,cars[i].bb.y);
		d.moveTo(0,cars[i].bb.y)
		d.lineTo(cars[i].bb.x,cars[i].bb.y);
		d.stroke();
	}
	
	d.fillStyle = "red";
	d.font = "30px Arial";
	d.fillText("X: " + Math.floor(cars[0].bb.x) + ". Y: " + Math.floor(cars[0].bb.y) + ". Speed: " + Math.floor(movementVelocity[0]),32,32);
	d.fillStyle = "black";
	
	for(let i = 0; i < onScreenGeneratedPedestrians; i++) {
		cars[i].update();
	}

	requestAnimationFrame(mainGameLoop);
}
