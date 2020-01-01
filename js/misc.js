console.log('Loading misc.js');

function line(x,y,x1,y1) {
	d.moveTo(x,y);
	d.lineTo(x1,y1);
	d.stroke();
}

function play(x) {
	x.play();
	console.log('Playing ' + x.src);
}

function stop(x) {
	x.pause();
	console.log('Stopping ' + x.src);
}

function cssToRGB(r,g,b) {
	return "rgb(" + r + "," + g + "," + b + ")";
}
