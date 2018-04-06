'use strict'

var controller = require(./controller);
var constant = require(./constant);
var renderer = require(./renderer);

run();

//game loop
function run(){
	addEvents();
	renderer.resize();
	renderer.reset();
	renderer.draw();
}

function addEvents(){
	document.addEventListener('keydown',controller.keydown,false);
	window.addEventListener('resize',renderer.resize,false);
}
