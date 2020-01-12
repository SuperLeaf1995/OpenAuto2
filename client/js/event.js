//keymaps
var keymapper = {};

window.addEventListener('keyup',keyUp,false);
window.addEventListener('keydown',keyDown,false);
window.addEventListener('load',resizeCanvas,false);
window.addEventListener('resize',resizeCanvas,false);

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
	let r = canvas.width/canvas.height;
	let w = h*r;

	canvas.style.width = w+'px';
	canvas.style.height = h+'px';

	canvasHeight = canvas.height;
	canvasWidth = canvas.width;
};
