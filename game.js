'use strict'

//constants
const canvas = getElementById('çanvas'),
	context = canvas.getContext('2d');
const nextCanvas = getElementById('next_canvas'),
	nctx = nextCanvas.getContext('2d');

const controlKeys = {left: "Left",right: "Right" ,up: "Up",down: "Down",esc: "Esc"};
const moveDirections = {LEFT:0,
					RIGHT:1,
					UP:2,
					DOWN:3};

const screenHeight = 25;//use block number to measure it
const screenWidth = 10;
const nextSize = 5;
const movingPieceSize = 4;

//use 16 bits to measure the pieces' shape,and present them in HEX 
//convert the bits of the first line to the first HEX number,and so as others
//the state of each block shows the initial state and rotation after 90,180,270 degrees' rotate
const shape31 = {state: [0x88C0,0x7400,0x0311,0x002C],color: 'red'}
const shape13 = {state: [0x44C0,0x4700,0x0322,0x00C2],color: 'blue'}
const shape22 = {state: [0x0660,0x0660,0x0660,0x0660],color: 'green'}
const shape04 = {state: [0x4444,0x0F00,0x2222,0x00F0],color: 'yellow'}
const shape121L = {state: [0x4620,0x0360,0x0264,0x0C60],color: 'navy'};
const shape121R = {state: [0x2640,0x0630，0x0264,0x0C60],color: 'maroon'}
const Pieces = [shape04,shape13,shape22,shape31,shape121L,shape121R];


//variables
var playing;
var dropingPiece = ;	
var changedTarget = [];//loaction:x,y;newColor:str
var newChange = [];
var blockWidth,blockHeight;
var piece = {};
var nextPiece = {};
var allState = [];
var perState = {};//color,hasBlock
var topHeightPerX = new Int32Array(screenWidth);
var topPieceVertexPerX = new Int32Array(4);
var score = 0;

//variables for next piece preview
var nextChange = [];
var nextChangeTarget = [];


//game loop
function run(){
	addEvents();
	var last = now = timestamp();
	resize();
	reset();
	draw();
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
			case controlKeys.left: move(moveDirections.LEFT); handled = true; break;
			case controlKeys.right: move(moveDirections.RIGHT); handled = true; break;
			case controlKeys.up: rotate(); handled = true; break;
			case controlKeys.down: move(moveDirections.DOWN); handled = true; break; 
	}
	else if (event.key == ''){
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

function resize(event){
	canvas.width canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	nextCanvas.width = canvas.clientWidth;
	nextCanvas.height = canvas.clientHeight;
	blockWidth = canvas.width / screenWidth;
	blockHeight = canvas.height / screenHeight;
	dropNext();
}

function timestamp(){
	return new Date().getTime();
}

function updateScreen(){
	newChange = changedTarget.slice(0);
	changedTarget = [];

	context.save();
	newChange.forEach((item,index,array) => {
		drawBlock(item);
	});
	/**let changedNum = newChange.length;
	for(let i = 0;i < changedNum;i++){
		drawBlock(newChange[i]);
	}**/
	context.restore();

}

function autoDrop(){
	if(playing){
		now = timestamp();
		dropLength = Math.min(1,(now - last));
		for(let i = 0;i < dropLength;i++){
			move(moveDirections.DOWN);
		}
		last = now;
	}
}
//for game logic
function startPlay(){
	hide('start');
	reset();
	playing = true;
}
function lose(){
	show('start');
	setVisualScore();
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

	drawNext();

	//TODO-last
	//generate next piece and show it at left
}

function draw(){
	updateScreen();
	autoDrop();
	//checkGround
	//clearLines-TODO
	window.requestAnimationFrame(draw);

}

function drawNext(){
	let padding = (nextSize - movingPieceSize) / 2;
	nctx.save();
	let startPointX = padding * blockWidth;
	let startPointY = padding * blockHeight;
	nctx.translate(startPointX,startPointY);
	nextPreviewPiece = {};
	nextPreviewPiece.currentState = nextPiece.currentState;
	nextPreviewPiece.type = nextPiece.type;
	nextPreviewPiece.location = {x: startPointX ,y:startPointY };
	nctx.clear(startPointX,startPointY,movingPieceSize,movingPieceSize);
	drawPiece(nextPreviewPiece,nctx);
	nctx.restore();	

}

//while rotating and moving,rewrite the block buffer
function rotate(){
//TODO
	onGroundCheck();

}
function move(inputDirection){
	var x = current.x;
	var y = current.y;
//TODO
	onGroundCheck();
}

function cleanLine(){
	//TODO
	//update 
	//topHeightPerX
	//drop next
	//update score
	
}
function onGroundCheck(){
	//piece.location
	//piece.state
//TODO
//cleanline

}

function drawPiece(pieceTarget,context){
	let x = pieceTarget.location.x;
	let y = pieceTarget.location.y;
	let color = pieceTarget.type.color;
	let state = pieceTarget.currentState;
	let initPos = 0x8000;
	for(let i = 0;i< 16;i++){
		if(initPos & state){
			let drawX = ;
			let drawY = ;
			drawBlock(drawX,drawY,color);
		}
		initPos >> 1;

	}



}

function drawBlock(x,y,color){
	//TODO
	context.fillStyle = block.color;
	let x = block.location.x * blockWidth;
	let y = block.location.y * blockHeight;
	//context.save();
	context.fillRect(x,y,blockWidth,blockHeight);
	if(block.color !== 'white'){
		context.strokeRect(x,y,blockWidth,blockHeight);
	}
	//context.restore();
}

run();
