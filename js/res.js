console.log('Loading res.js');

var cars = {}; //cars
var pedestrian = {}; //total peds minus the player
var onScreenGeneratedPedestrians = 8; //total peds, counting player

var carGoing;

var effect_reverseCarLight = new Image();
effect_reverseCarLight = "../img/effects/reverseLights.png";
effect_reverseCarLight = function() { };

var carImg = new Image();
carImg.src = "../img/car/car1.png";

var keymapper = {};

var sfx_car_reverse = new Audio();
sfx_car_reverse.src = "../sfx/reverse.wav";
sfx_car_reverse.volume = 0.4;
sfx_car_reverse.ontimeupdate = function() {
  if(this.currentTime > (this.duration - 0.4) && carGoing === -1){
    this.currentTime = 0;
  }
};

var sfx_car_commonEngine = new Audio();
sfx_car_commonEngine.src = "../sfx/engine.wav";
sfx_car_commonEngine.volume = 0.4;
sfx_car_commonEngine.ontimeupdate = function() {
  if(this.currentTime > (this.duration - 0.4) && carGoing === 1){
    this.currentTime = 0;
  }
};

var sfx_car_starting = new Audio();
sfx_car_starting.src = "../sfx/starter.wav";
sfx_car_starting.volume = 0.4;
sfx_car_starting.ontimeupdate = function() {
  if(this.currentTime > (this.duration - 0.4)){
    this.currentTime = 0;
  }
};

const movMax = 12;
const movementNegativeMax = 5;
const movStep = 0.1;
const movBrakeCurvePenalty = 380;
const movementVelocityChange = 0.1;
var movementVelocity = {};
var direction;
