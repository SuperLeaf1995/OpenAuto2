//--------------------------
//Main Game
//--------------------------

var toIssue;
var timer = 0;

var test = [];
for(let i = 0; i < 12; i++) {
	test[i] = [];
	for(let i2 = 0; i2 < 8; i2++) {
		test[i][i2] = new MapTile(tileSize);
	}	
}

function mainGame() {
	display.strokeStyle = 'blue';

	if ((keymapper.w) && !(keymapper.a) && !(keymapper.d)) { userData[id].toIssue = 0; } //advance, no turn
	else if ((keymapper.s)  && !(keymapper.a) && !(keymapper.d)) { userData[id].toIssue = 1; } //backwards
	else if ((keymapper.d) && !(keymapper.w) && !(keymapper.s)) { userData[id].toIssue = 2; } //turn, no forward
	else if ((keymapper.a) && !(keymapper.w) && !(keymapper.s)) { userData[id].toIssue = 3; } //^
	else if ((keymapper.d) && (keymapper.w) && !(keymapper.s)) { userData[id].toIssue = 4; } //turn, forward
	else if ((keymapper.a) && (keymapper.w) && !(keymapper.s)) { userData[id].toIssue = 5; } //^
	else if ((keymapper.d) && (keymapper.s) && !(keymapper.w)) { userData[id].toIssue = 6; } //turn, backward
	else if ((keymapper.a) && (keymapper.s) && !(keymapper.w)) { userData[id].toIssue = 7; } //^
	else { userData[id].toIssue = 8; } //no key
	
	display.clearRect(0,0,canvasWidth,canvasHeight);

	if(timer > 100) {
		socket.emit('userUpdate',userData[id]); //send them our new coordinates
		timer = 0;
	}

	for(let i in test) {
		for(let i2 in test[i]) {
			let a = tileSize*i;
			let b = tileSize*i2;
				
			test[i][i2].setNewCoords(a,b,0);
			test[i][i2].update(userData[id].obj.sprite.bb.x/7,userData[id].obj.sprite.bb.y/7,1);
			test[i][i2].draw(display);
		}
	}

	for(let index in userData) {		
		userData[index].obj.update(userData[index].toIssue);
		display.fillText(userData[index].nick,userData[index].obj.sprite.bb.x-userData[id].obj.sprite.bb.x+(canvasWidth/2)-(userData[index].obj.sprite.bb.w/2),userData[index].obj.sprite.bb.y-userData[id].obj.sprite.bb.y+(canvasHeight/2)-(userData[index].obj.sprite.bb.h/2)-48);
		//draw arrows, well kind of...
		display.beginPath();
		display.moveTo((canvasWidth/2)-(userData[id].obj.sprite.bb.w/2),(canvasHeight/2)-(userData[id].obj.sprite.bb.h/2))
		display.lineTo(userData[index].obj.sprite.bb.x-userData[id].obj.sprite.bb.x+(canvasWidth/2)-(userData[index].obj.sprite.bb.w/2),userData[index].obj.sprite.bb.y-userData[id].obj.sprite.bb.y+(canvasHeight/2)-(userData[index].obj.sprite.bb.h/2))
		display.stroke();
	}

	timer++;
	requestAnimationFrame(mainGame);
}
