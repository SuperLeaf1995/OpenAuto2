const c = document.getElementById("canvas");
const d = c.getContext("2d");

console.log('Setting canvas');

if(window.devicePixelRatio > 1) {
	c.width =  (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth)*2;
	canvasMainScreen.height = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight)*2;
	display.scale(2,2);
}
else {
	c.width =  window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	c.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
}

window.onresize = function(e) //if user thinks we arent bruh, we will show them the true bruh
{
	if(window.devicePixelRatio > 1) //so burh
	{
		c.width =  (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth)*2;
		canvasMainScreen.height = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight)*2;
		display.scale(2,2);
	}
	else
	{
		c.width =  window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		c.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
	}
	console.log('Canvas resized. New canvas size ' + c.width + "x" + c.height);
}

d.strokeStyle = "#FFFFFF"; //Default color
