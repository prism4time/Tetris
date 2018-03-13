'use strict'

//constants

const canvas = getElementById('çanvas'),
	context = canvas.getContext('2d') 
//var nextCanvas = getElementById('next_canvas');
const controlKeys = {left: "Left",right: "Right" ,up: "Up",down: "Down",esc: "Esc"};
const moveDirections = {LEFT:0,
					RIGHT:1,
					UP:2,
					DOWN:3};

const screenHeight = 25;//use block number to measure it
const screenWidth = 10;
const movingPieceSize = 4;

//use 16 bits to measure the pieces' shape,and present them in HEX 
//convert the bits of the first line to the first HEX number,and so as others
//the state of each block shows the initial state and rotation after 90,180,270 degrees' rotate
const shape31 = {state: [0x88C0,0x7400,0x0311,0x002C],color: 'red'}
const shape13 = {state: [0x44C0,0x4700,0x0322,0x00C2],color: 'blue'}
const shape22 = {state: [0x0660,0x0660,0x0660,0x0660],color: 'green'}
const shape04 = {state: [0x4444,0x0F00,0x2222,0x00F0],color: 'yellow'}//TODO
const shape121L = {state: [0x4620,0x0360,0x0264,0x0C60],color: 'navy'};
const shape121R = {state: [0x2640,0x0630，0x0264,0x0C60],color: 'maroon'}
const Pieces = [shape04,shape13,shape22,shape31,shape121L,shape121R];


//variables
var playing;
	dropingPiece = ;	
var changedTarget = [];
var newChange = [];
var updateScreenLock = false;
var blockWidth,blockHeight;
var piece = {};
var nextPiece = {};//TODO
var allState = [];
var perState = {};//TODO,color,hasBlock

//game loop
function run(){
	addEvents();

	resize();
	reset();
	//TODO

}
function addEvents(){
	document.addEventListener('keydown',keydown,false);
	window.addEventListener('resize',resize,false);
}

//catch the input
function keydown(event){
	const keyName = event.key;
	let handled = false;
	if(playing){
		switch(keyName){
			case controlKeys.left: move(moveDirections.LEFT); break;
			case controlKeys.right: move(moveDirections.RIGHT); break;
			case controlKeys.up: rotate();break;
			case controlKeys.down: move(moveDirections.DOWN); break; 
	}
	else if (event.key == ''){
		startPlay();
		handled = true;
	}
	if(handled){
		event.preventDefault();
	}
}

function resize(event){
	canvas.width canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	nextCanvas.width = canvas.clientWidth;
	nextCanvas.height = canvas.clientHeight;
	blockWidth = canvas.width / screenWidth;
	blockHeight = canvas.height / screenHeight;
	dropNext();
}

function updateScreen(){
	//updateScreenLock = true;
	newChange = changedTarget.slice(0);
	changedTarget = [];
	//updateScreenLock = false;

	context.save();
	let block = {};//TODO

	context.restore();

}
//for game logic
function startPlay(){
	hide('start');
	reset();
	playing = true;
}
function lose(){
	show('start');
	//TODO
	playing = false;
}

function randomChooseNext(){
	let randomNum = Math.random()
	nextPiece.location.x = randomNum * screenWidth;
	nextPiece.location.y = randomNum * screenHeight;
	let type = Math.floor(randomNum * Pieces.length);
	nextPiece.type = Pieces[type];
	nextPiece.currentState = nextPiece.type[0];
}

//function to handle blocks


function dropNext(){
	//TODO
}
function draw(changedTarget){


}

//while rotating and moving,rewrite the block buffer
function rotate(){

	onGroundCheck();

}
function move(inputDirection){
	var x = current.x;
	var y = current.y;
//TODO
	onGroundCheck();
}

function cleanLine(){
	
}
function onGroundCheck(){
	//piece.location
	//piece.state
//TODO

}
function drawBlock(block){
	context.fillStyle = block.color;
	let x = block.location.x * blockWidth;
	let y = block.location.y * blockHeight;
	context.save();
	context.fillRect(x,y,blockWidth,blockHeight);
	if(block.color !== 'white'){
		context.strokeRect(x,y,blockWidth,blockHeight);
	}
	context.restore();
}

run();
