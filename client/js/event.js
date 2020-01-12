//keymaps
var keymapper = {};

window.addEventListener('keyup',keyUp,false);
window.addEventListener('keydown',keyDown,false);
window.addEventListener('load',resizeCanvas,false);
window.addEventListener('resize',resizeCanvas,false);

window.setInterval(function() {
	let e = document.getElementById('chat');
	e.scrollTop = e.scrollHeight;
},750); //autoscroll

function keyUp(e) {
	var char = (String.fromCharCode(e.keyCode)).toLowerCase();
	keymapper[char] = false;
};
function keyDown(e) {
	var char = (String.fromCharCode(e.keyCode)).toLowerCase();
	keymapper[char] = true;
};

function resizeCanvas() {
	let h = window.innerHeight;
	let w = window.innerWidth;

	canvas.style.width = w+'px';
	canvas.style.height = h+'px';

	canvasHeight = canvas.height;
	canvasWidth = canvas.width;
};