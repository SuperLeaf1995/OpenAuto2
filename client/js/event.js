//keymaps
var keymapper = {};

if(window.addEventListener) {
	window.addEventListener('keyup',keyUp);
	window.addEventListener('keydown',keyDown);
	window.addEventListener('load',resizeCanvas);
	window.addEventListener('resize',resizeCanvas);
} else {
	window.attachEvent('keyup',keyUp);
	window.attachEvent('keydown',keyDown);
	window.attachEvent('load',resizeCanvas);
	window.attachEvent('resize',resizeCanvas);
}

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
