'use strict'

var renderer = require('./renderer');
run();

//game loop
function run(){
	addEvents();
	renderer.resize();
	renderer.reset();
	renderer.draw();
}

function addEvents(){
	window.addEventListener('keydown',renderer.keydown,false);
	window.addEventListener('resize',renderer.resize,false);
}
