//chat messages
let inputBox = document.getElementById('chatbox');
inputBox.placeholder = "Type wisely";

//--------------------------
//Main Game
//--------------------------

var toIssue;
var timer = 80;

function mainGame() {
	if (keymapper.w && !(keymapper.a) && !(keymapper.d)) { userData[id].toIssue = 0; } //advance, no turn
	else if (keymapper.s  && !(keymapper.a) && !(keymapper.d)) { userData[id].toIssue = 1; } //backwards
	else if (keymapper.d && !(keymapper.w) && !(keymapper.s)) { userData[id].toIssue = 2; } //turn, no forward
	else if (keymapper.a && !(keymapper.w) && !(keymapper.s)) { userData[id].toIssue = 3; } //^
	else if (keymapper.d && keymapper.w && !(keymapper.s)) { userData[id].toIssue = 4; } //turn, forward
	else if (keymapper.a && keymapper.w && !(keymapper.s)) { userData[id].toIssue = 5; } //^
	else if (keymapper.d && keymapper.s && !(keymapper.w)) { userData[id].toIssue = 6; } //turn, backward
	else if (keymapper.a && keymapper.s && !(keymapper.w)) { userData[id].toIssue = 7; } //^
	else { userData[id].toIssue = 8; } //no key
	
	display.clearRect(0,0,canvasWidth,canvasHeight);
	//display.fillRect(0,0,canvasWidth,canvasHeight);
	
	if(timer > 80) {
		socket.emit('userUpdate',userData[id]); //send them our new coordinates
		timer = 0;
	}

	for(let index in userData) {
		userData[index].obj.update(userData[index].toIssue);
	}
	
	userData[id].toIssue = 8;
	timer++;
	requestAnimationFrame(mainGame);
}
