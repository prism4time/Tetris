'use strict'

var renderer = require('./game/renderer');
run();

//game loop
function run(){
	addEvents();
	renderer.resize();
	renderer.reset();
	renderer.draw();
}

function addEvents(){
	window.addEventListener('keydown',renderer.keydown);
	window.addEventListener('resize',renderer.resize);
}
