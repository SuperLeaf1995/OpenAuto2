//keymaps
var keymapper = {};
//limiters for cars
var movVel = 0; const movMax = 10; const movStep = 0.1;
//Used for cubes
const cube_amount = 1000;
const cube_radius = 2;
let projection_center_x = (canvasWidth/2);
let projection_center_y = (canvasHeight/2);
let field_of_view = canvasWidth * 0.8;
const cube_lines = [[0, 1], [1, 3], [3, 2], [2, 0], [2, 6], [3, 7], [0, 4], [1, 5], [6, 7], [6, 4], [7, 5], [4, 5]];
const cube_vertices = [[-1, -1, -1],[1, -1, -1],[-1, 1, -1],[1, 1, -1],[-1, -1, 1],[1, -1, 1],[-1, 1, 1],[1, 1, 1]];

var tileSize = 32;

//assets
//cuboid
var f;
var carImg = new Image();
carImg.src = "img/car/car1.png";
carImg.onload = function(){
	f = new Sprite(display,this,100,100,0,1);
	display.strokeStyle = "#00FF00";
	requestAnimationFrame(mainGame);
};

//--------------------------
//On( Event ) handlers
//--------------------------

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

//--------------------------
//Main Game
//--------------------------

function mainGame() {

	display.fillStyle = 'black';
	
	if (keymapper.w) {movVel >= movMax ? movVel = movMax :   movVel += movStep; }
	if (keymapper.s) {movVel <= -movMax ? movVel = -movMax : movVel -= movStep; }
	if (keymapper.d && movVel != 0) {f.bb.angle+=movVel/140; }
	if (keymapper.a && movVel != 0) {f.bb.angle-=movVel/140; }
	
	if (!(keymapper.s || keymapper.w) && movVel > 0) {movVel -= movStep} else
	if (!(keymapper.s || keymapper.w) && movVel < 0) {movVel += movStep};
	if (movVel > 0 && movVel < 0.1) {movVel = 0} 
	if (movVel < 0 && movVel > -0.1) {movVel = 0};
	
	f.move(movVel);
	
	display.clearRect(0,0,canvasWidth,canvasHeight);
	display.fillRect(0,0,canvasWidth,canvasHeight);
	
	display.beginPath();
	display.moveTo(f.bb.p[0].x,f.bb.p[0].y);
	display.lineTo(f.bb.p[1].x,f.bb.p[1].y);
	display.lineTo(f.bb.p[2].x,f.bb.p[2].y);
	display.lineTo(f.bb.p[3].x,f.bb.p[3].y);
	display.lineTo(f.bb.p[0].x,f.bb.p[0].y);

	display.moveTo(f.bb.x,0)
	display.lineTo(f.bb.x,f.bb.y);

	display.moveTo(0,f.bb.y)
	display.lineTo(f.bb.x,f.bb.y);

	display.stroke();
	
	f.update();
	
	//now draw text and stuff
	display.fillStyle = '#00FF00';

	display.fillText('=================== Stats ===================',16,16);
	display.fillText('X: '+Math.floor(f.bb.x)+' Y: '+Math.floor(f.bb.y),16,32);
	display.fillText('Angle: '+Math.floor(f.bb.angle),128,32);
	display.fillText('PO:X: '+Math.floor(f.bb.p[0].x)+' Y: '+Math.floor(f.bb.p[0].y),16,48)
	display.fillText('P1:X: '+Math.floor(f.bb.p[1].x)+' Y: '+Math.floor(f.bb.p[1].y),16,64)
	display.fillText('P2:X: '+Math.floor(f.bb.p[2].x)+' Y: '+Math.floor(f.bb.p[2].y),16,80)
	display.fillText('P3:X: '+Math.floor(f.bb.p[3].x)+' Y: '+Math.floor(f.bb.p[3].y),16,96);
	display.fillText('SocketID: '+socket.id,16,112);

	requestAnimationFrame(mainGame);
}
