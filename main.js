const c = document.getElementById("canvas");
c.width = 1200;
c.height = 1000;

const d = c.getContext("2d");



function line(x,y,x1,y1)
{
	
	
	d.moveTo(x,y);
	d.lineTo(x1,y1);
	d.stroke();
}
var f;
var carImg = new Image();
carImg.src = "img/car/car1.png";
carImg.onload = function(){
	f = new Sprite(d,this,100,100,0,1);
	f2 = new Sprite(d,this,150,100,45,0.4);
	f3 = new Sprite(d,this,200,100,15,1);
	f4 = new Sprite(d,this,250,100,200,0.7);
	requestAnimationFrame(bruh);
};

var keymapper = {};

var movVel = 0; const movMax = 10; const movStep = 0.1;

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
d.strokeStyle = "#FFFFFF";

function bruh() {
	if (keymapper.w) {movVel >= movMax ? movVel = movMax :   movVel += movStep; }
	if (keymapper.s) {movVel <= -movMax ? movVel = -movMax : movVel -= movStep; }
	if (keymapper.d && movVel != 0) {f.bb.angle+=movVel/140; }
	if (keymapper.a && movVel != 0) {f.bb.angle-=movVel/140; }
	
	if (!(keymapper.s || keymapper.w) && movVel > 0) {movVel -= movStep} else
	if (!(keymapper.s || keymapper.w) && movVel < 0) {movVel += movStep};
	if (movVel > 0 && movVel < 0.1) {movVel = 0} 
	if (movVel < 0 && movVel > -0.1) {movVel = 0};
	
	f.move(movVel);

	d.clearRect(0,0,1000,1000);
	d.fillRect(0,0,1000,1000);
	/*
	d.beginPath();
	d.moveTo(f.bb.p[0].x,f.bb.p[0].y);
	d.lineTo(f.bb.p[1].x,f.bb.p[1].y);
	d.lineTo(f.bb.p[2].x,f.bb.p[2].y);
	d.lineTo(f.bb.p[3].x,f.bb.p[3].y);
	d.lineTo(f.bb.p[0].x,f.bb.p[0].y);

	d.moveTo(f.bb.x,0)
	d.lineTo(f.bb.x,f.bb.y);

	d.moveTo(0,f.bb.y)
	d.lineTo(f.bb.x,f.bb.y);

	d.stroke();
	*/
	f4.update();
	f3.update();
	f2.update();
	f.update();

	requestAnimationFrame(bruh);
}
