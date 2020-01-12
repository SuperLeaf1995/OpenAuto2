var socket = io('https://openauto2.herokuapp.com/'); //create a new socket!
//var socket = io('http://localhost:5000/');

var mainCamera = new Camera(0,0,1);
var userData = {};
var id;

socket.on('connect',function() {
	console.log('Connection established');
	console.log('Assigned socket id: '+socket.io.engine.id);
	id = socket.io.engine.id;
	display.fillStyle = 'black';
});

socket.on('userReg',function(user) {
	userData = user; //the stuff  from user is now in our local thing
	console.log(userData);
	for(let index in userData) {
		delete userData[index].obj;
		userData[index].obj = new Car(userData[index].x,userData[index].y,userData[index].z,userData[index].skin,display,mainCamera,false,userData[index].rot);
	}
	requestAnimationFrame(mainGame);
});

socket.on('userDel',function(i) {
	console.log('Delete user');
	delete userData[i]; //delete specified user out of array shit
});

socket.on('userSpreadMessage',function(msg) {
	console.log(msg);
	let a = document.createElement('li'); //the li element
	let b = document.createTextNode(msg); //content in li
	let c = document.getElementById('textland'); //where to put li
	
	a.appendChild(b); //appends text to li
	c.appendChild(a); //appends li to the chat div
	
	c.scrollBy(0,50);
});

function sendMessage() {
	let a = document.getElementById('chatbox');
	
	if(a.value === undefined || a.value === "") {
		return;
	}
		
	socket.emit('userSendMessage',a.value);
}
