//var socket = io('https://openauto2.herokuapp.com/'); //create a new socket!
var socket = io('http://localhost:5000/');

var userData = {};
var carData = {};
var localeData = {};
var id;

socket.on('connect',function() {
	console.log('Connection established');
	console.log('Assigned socket id: '+socket.io.engine.id);
	id = socket.io.engine.id;
	display.fillStyle = 'black';
});

socket.on('userReceiveCarData',function(car) {
	carData = car;
});

socket.on('userReg',function(user) {
	userData = user; //the stuff  from user is now in our local thing
	for(let index in userData) {
		delete userData[index].obj;
		userData[index].obj = new Car(userData[index].x,userData[index].y,userData[index].z,userData[index].carType,display,userData[index].rot);
	}
	requestAnimationFrame(mainGame);
});

socket.on('userDel',function(i) {
	console.log('Delete user');
	delete userData[i]; //delete specified user out of array shit
});

socket.on('userReceiveChatHistory',function(messages) {
	for(let i in messages) {
		console.log(messages[i]);
		let a = document.createElement('li'); //the li element
		let b = document.createTextNode(messages[i]); //content in li
		let c = document.getElementById('textland'); //where to put li
		a.appendChild(b); //appends text to li
		c.appendChild(a); //appends li to the chat div
		//c.scrollBy(0,50);
	}
});

socket.on('userSpreadMessage',function(msg) {
	console.log(msg);
	let a = document.createElement('li'); //the li element
	let b = document.createTextNode(msg); //content in li
	let c = document.getElementById('textland'); //where to put li
	a.appendChild(b); //appends text to li
	c.appendChild(a); //appends li to the chat div
	//c.scrollBy(0,50);
});

socket.on('userReceiveLocale',function(locale) {
	//get user language
	var lang = window.navigator.userLanguage || window.navigator.language;
	localeData = locale[lang]; //set appropiate locale
});

function sendMessage() {
	let a = document.getElementById('chatbox');
	
	if(a.value === undefined || a.value === "") {
		return;
	}
	socket.emit('userSendMessage',a.value);
	a.value = "";
}
