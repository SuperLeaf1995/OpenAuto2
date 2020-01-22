var socket = io('https://openauto2.herokuapp.com/'); //create a new socket!
//var socket = io('http://localhost:5000/');

var userData = {};
var carData = {};
var localeData = {};
var mapData = {};
var id;

//When we connect
socket.on('connect',function() {
	console.log('Connection established');
	console.log('Assigned socket id: '+socket.io.engine.id);
	id = socket.io.engine.id;
});

//General data
socket.on('userReceiveData',function({mess,car,local}) {
	var lang = window.navigator.userLanguage || window.navigator.language;
	localeData = local[lang]; //set appropiate locale
	for(let i in mess) {
		let a = document.createElement('li'); //the li element
		let b = document.createTextNode(mess[i]); //content in li
		let c = document.getElementById('textland'); //where to put li
		a.appendChild(b); //appends text to li
		c.appendChild(a); //appends li to the chat div
		//c.scrollBy(0,50);
	}
	carData = car;
	//set the locale of the HTML elements text in the page
	let i = document.getElementById('chatbox');
	i.placeholder = localeData.type;
	i = document.getElementById('sendButton');
	i.innerHTML = localeData.send;
});
//User stuff
socket.on('userReceiveList',function(user) {
	userData = user; //the stuff  from user is now in our local thing
	for(let index in userData) {
		userData[index].obj = new Car(userData[index].x,userData[index].y,userData[index].z,userData[index].carType,display,userData[index].rot,false);
	}
	userData[id].obj.sprite.focus = true; //its the main player, set camera focus on him
});
socket.on('userNew',function(user) {
	userData[user.id] = user; //register new user
	//create new car object for that user
	userData[user.id].obj = new Car(user.x,user.y,user.z,user.carType,display,user.rot,false);
	if(user.id === id) {
		requestAnimationFrame(mainGame);
	}
});
socket.on('userUpdate',function(user) {
	//assign user data the received user
	userData[user.id] = user;
	//delete old stuff
	delete userData[user.id].obj;
	//plot new stuff
	userData[user.id].obj = new Car(user.x,user.y,user.z,user.carType,display,user.rot,false);
});
socket.on('userDelete',function(i) {
	delete userData[i]; //delete specified user out of array shit
});

//Chat socket stuff
socket.on('userSpreadMessage',function(msg) {
	let a = document.createElement('li'); //the li element
	let b = document.createTextNode(msg); //content in li
	let c = document.getElementById('textland'); //where to put li
	a.appendChild(b); //appends text to li
	c.appendChild(a); //appends li to the chat div
	//c.scrollBy(0,50);
});
function sendMessage() {
	let a = document.getElementById('chatbox');
	socket.emit('userSendMessage',a.value);
	a.value = "";
}
