console.clear();

//Main display sources
const canvasMainScreen = document.getElementById('canvas_main');
const display = canvasMainScreen.getContext("2d");

if(window.devicePixelRatio > 1) {
  canvasMainScreen.width =  (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth)*2;
  canvasMainScreen.height = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight)*2;
  display.scale(2,2);
}
else {
  canvasMainScreen.width =  window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  canvasMainScreen.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
}

//Handle input
var keys = [];
//The main player itself
var mainPlayer;
//Common size for players
const commonPlayerSize = 128;
const tileSize = 1024;
//Map image
var mainMapImage = new Image();
mainMapImage.src = "map.png";
//Outbounds image
var placeholderMap = new Image();
placeholderMap.src = "normalbg.png";
//Size of map
const mapSizeW = 4096;
const mapSizeH = 4096;

//Used for cubes
const cube_amount = 1000;
const cube_radius = 2;
let projection_center_x = (canvasMainScreen.width/2);
let projection_center_y = (canvasMainScreen.height/2);
let field_of_view = canvasMainScreen.width * 0.8;
const cube_lines = [[0, 1], [1, 3], [3, 2], [2, 0], [2, 6], [3, 7], [0, 4], [1, 5], [6, 7], [6, 4], [7, 5], [4, 5]];
const cube_vertices = [[-1, -1, -1],[1, -1, -1],[-1, 1, -1],[1, 1, -1],[-1, -1, 1],[1, -1, 1],[-1, 1, 1],[1, 1, 1]];

function tile(radius) {
  this.radius = radius;
  this.project = function(x,y,z) {
    const sizeProjection = field_of_view / (field_of_view+z);
    const xProject = (x*sizeProjection)+projection_center_x;
    const yProject = (y*sizeProjection)+projection_center_y;
    return {
      size: sizeProjection,
      x: xProject,
      y: yProject
    }
  }
  this.setNewCoords = function(x,y,z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  this.setNew2DCoords = function(x,y) {
    this.x = x;
    this.y = y;
  }
  this.draw = function() {
    if(this.z < (-field_of_view + this.radius)) {
      return;
    }
    for(let i = 0; i < cube_lines.length; i++) {
      const v1 = { //Draw all the cube lines
        x: this.x + (this.radius * cube_vertices[cube_lines[i][0]][0]),
        y: this.y + (this.radius * cube_vertices[cube_lines[i][0]][1]),
        z: this.z + (this.radius * cube_vertices[cube_lines[i][0]][2])
      };
      const v2 = {
        x: this.x + (this.radius * cube_vertices[cube_lines[i][1]][0]),
        y: this.y + (this.radius * cube_vertices[cube_lines[i][1]][1]),
        z: this.z + (this.radius * cube_vertices[cube_lines[i][1]][2])
      };
      const v1Project = this.project(v1.x, v1.y, v1.z);
      const v2Project = this.project(v2.x, v2.y, v2.z);
      display.beginPath();
      display.moveTo(v1Project.x, v1Project.y);
      display.lineTo(v2Project.x, v2Project.y);
      display.stroke();
    }
  }
  this.update = function() {
    let cubeX = ((-mainPlayer.x*5.5)+(canvasMainScreen.width/2))-(commonPlayerSize*8)-this.x;
    let cubeY = ((-mainPlayer.y*5.5)+(canvasMainScreen.height/2))-(commonPlayerSize*8)-this.y;
    let cubeZ = commonPlayerSize*32;
    this.x = cubeX;
    this.y = cubeY;
    this.z = cubeZ;
    projection_center_x = (canvasMainScreen.width/2)-(mainPlayer.width/2);
    projection_center_y = (canvasMainScreen.height/2)-(mainPlayer.height/2);
  }
}

function player(x,y,width,height,skin) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;

  this.angle = 0;

  this.skin = new Image();
  this.skin.src = skin;

  //Now stats
  this.health = 256;
  this.armor = 256;

  //Receive damage
  this.receiveDamage = function(damage) {
    if(this.armor > 0) {
      if(this.armor < damage) {
        damage -= armor;
        this.armor = 0;
        this.health -= damage;
      }
      else {
        this.armor -= damage
      }
    }
    else {
      this.health -= damage;
    }
  }

  //Update (redraw) the player
  this.updateView = function() {
    display.drawImage(this.skin,(canvasMainScreen.width/2)-(this.width/2),(canvasMainScreen.height/2)-(this.height/2),this.width,this.height);
  }
  //Set coordinates
  this.setPosition = function(x1,y1) {
    this.x = x1;
    this.y = y1;
  }
  //Move to the left
  this.moveLeft = function() {
    this.x -= 5;
    this.angle = 90;
  }
  //Move to the right
  this.moveRight = function() {
    this.x += 5;
    this.angle = 270;
  }
  //Move up
  this.moveUp = function() {
    this.y -= 5;
    this.angle = 180;
  }
  //Move down
  this.moveDown = function() {
    this.y += 5;
    this.angle = 0;
  }
}

window.onkeydown = function downKey(e) {
  keys[e.keyCode] = true;
  //Arrow keys
  if(keys[37]) { mainPlayer.moveLeft(); }
  if(keys[38]) { mainPlayer.moveUp(); }
  if(keys[39]) { mainPlayer.moveRight(); }
  if(keys[40]) { mainPlayer.moveDown(); }
  //debug
  if(keys[84] || keys[65]) { mainPlayer.receiveDamage(10); }
}

window.onkeyup = function upKey(e) {
  keys[e.keyCode] = false;
}

var gradient; //Thing for making gradient

window.onload = function start() { //Starting the page itself, initialize the game
  //Set the canvas to a correct size, this can be changed when the browser resizes
  console.log('Started game\n');
  console.log('Initialized canvas: ' + canvasMainScreen.width + 'px : ' + canvasMainScreen.height + 'px\n');
  //The main player
  mainPlayer = new player(0,0,commonPlayerSize,commonPlayerSize,"player.png");
  //Tiles are of the size of the player
  test = new tile(tileSize/2);

  gradient = display.createLinearGradient(0, 0, 200, 0);
  gradient.addColorStop(0, "red");
  //gradient.addColorStop(0.5, "yellow");
  gradient.addColorStop(1, "green");
  update();
}

window.onresize = function resize() {
  //Browser was resized? No problem!, Just recalculate smh
  if(window.devicePixelRatio > 1) {
    canvasMainScreen.width =  (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth)*2;
    canvasMainScreen.height = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight)*2;
    display.scale(2,2);
  }
  else {
	canvasMainScreen.width =  window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	canvasMainScreen.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  }
}

function toRGB(r,g,b) {
  return "rgb(" + r + "," + g + "," + b + ")";
}

function update() {

  //If out of bounds, put this image
  //display.drawImage(mainMapImage,0,0,mapSizeW,mapSizeH);
  display.fillStyle = 'grey';
  display.fillRect(0,0,canvasMainScreen.width,canvasMainScreen.height);

  //test.setNewCoords(cubeX,cubeY,cubeZ);

  test.setNewCoords(0,0,0);
  test.update();
  test.draw();

  //Healthbar
  display.fillStyle = 'black';
  display.fillRect(4,4,264,40);
  display.fillStyle = gradient; //Actual healthbar
  display.fillRect(8,8,(mainPlayer.health*100)/100,32);

  //The player itself
  mainPlayer.updateView();

  //debug
  display.font = "30px Comic Sans MS";
  display.fillStyle = 'white';
  display.fillText("Health",12,33);

  display.fillText("USE",canvasMainScreen.width-120,canvasMainScreen.height-30);

  requestAnimationFrame(update);
}
