//chat messages
let inputBox = document.getElementById('chatbox');
let rand = Math.random();
if(rand < 0.1) { inputBox.placeholder = "Type wisely"; }
else if(rand < 0.2) { inputBox.placeholder = "Type something"; }
else if(rand < 0.3) { inputBox.placeholder = "Type with the mouse"; }
else if(rand < 0.4) { inputBox.placeholder = "Type with a keyboard"; }
else if(rand < 0.5) { inputBox.placeholder = "Long live PS/2, use a PS/2 keyboard"; }
else if(rand < 0.6) { inputBox.placeholder = "Use your hands to type something in this area"; }
else if(rand < 0.7) { inputBox.placeholder = "Type with your hands"; }
else if(rand < 0.8) { inputBox.placeholder = "Type with the eyes"; }
else if(rand < 0.9) { inputBox.placeholder = "Type anything"; }
else if(rand < 1) { inputBox.placeholder = "T y p e   a n y t h i n g . . ."; }

//--------------------------
//Main Game
//--------------------------

var toIssue;

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
	
	//display.clearRect(0,0,canvasWidth,canvasHeight);
	display.fillRect(0,0,canvasWidth,canvasHeight);
	
	if(Math.random() < 0.003) {
		socket.emit('userUpdate',userData[id]); //send them our new coordinates
	}

	for(let index in userData) {
		userData[index].obj.update(userData[index].toIssue);
	}
	
	userData[id].toIssue = 8;
	requestAnimationFrame(mainGame);
}
