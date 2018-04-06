'use strict'

var constant = require(./constant);
var action = require(./renderer);

//catch the input
function keydown(event){
	const keyName = event.key;
	let handled = false;
	if(playing){
		switch(keyName){
			case controlKeys.left: move(moveDirections.LEFT); handled = true; break;
			case controlKeys.right: move(moveDirections.RIGHT); handled = true; break;
			case controlKeys.up: rotate(); handled = true; break;
			case controlKeys.down: move(moveDirections.DOWN); handled = true; break; 
		}
	}
	else if (event.key == ' '){
		startPlay();
		handled = true;
	}
	else if (event.key == controlKeys.esc){
		lose()
		handled =true;
	}
	if(handled){
		event.preventDefault();
	}
}
function startPlay(){
	let title = document.getElementById('start');
	title.style.visibility = 'hidden';
	reset();
	playing = true;
}
function lose(){
	show('start');
	setVisualScore();
	playing = false;
}
