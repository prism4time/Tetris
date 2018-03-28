'use strict'

//constants
const canvas = document.getElementById('canvas'),
	context = canvas.getContext('2d');
const nextCanvas = document.getElementById('next_canvas'),
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
const shape121R = {state: [0x2640,0x0630,0x0264,0x0C60],color: 'maroon'};
const Pieces = [shape04,shape13,shape22,shape31,shape121L,shape121R];
const Color = {white: 0 ,red: 1,blue: 2,green: 3,yellow: 4,navy: 5,maroon: 6};


//variables
var playing;
var dropingPiece = {};//	
var changedTarget = [];//loaction:x,y;newColor:str
var newChange = [];
var blockWidth,blockHeight;
var piece = {};
var newColor;
var nextPiece = {};
var allState = [];
var perState = {};//color,hasBlock
var topPieceVertexPerX = new Int32Array(4);
var score = 0;
var nextPreviewPiece = {};
var now;
var last;

//variables for next piece preview
var nextChange = [];

var globalRecords = new Int32Array(screenWidth * screenHeight);


run();


//game loop
function run(){
	addEvents();
	now = timestamp();
	last = now;
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

function resize(event){
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	nextCanvas.width = nextCanvas.clientWidth;
	nextCanvas.height = nextCanvas.clientHeight;
	blockWidth = canvas.width / screenWidth;
	blockHeight = canvas.height / screenHeight;
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
	context.restore();
}

function autoDrop(){
	if(playing){
		now = timestamp();
		let dropLength = Math.min(1,(now - last));
		for(let i = 0;i < dropLength;i++){
			move(moveDirections.DOWN);
		}
		last = now;
	}
}
//for game logic
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

function reset(){
	score = 0;
	randomChooseNext();
	for(let i = 0;i < screenHeight;i++){
		for(let j = 0;j < screenWidth;j++){
			drawBlock(i,j,"white");
			globalRecords[i * screenWidth + j] = "white";
		}
	}
	dropNext();
}
function randomChooseNext(){
	let randomNum = Math.random();
	nextPiece.location = {};
	nextPiece.location.x = randomNum * screenWidth;
	nextPiece.location.y = randomNum * screenHeight;
	let type = Math.floor(randomNum * Pieces.length);
	nextPiece.type = Pieces[type];
	nextPiece.currentState = nextPiece.type[0];
}

//function to handle blocks
function dropNext(){
	randomChooseNext();
	drawNext();
	dropingPiece.location = nextPreviewPiece.location;
	dropingPiece.type = nextPreviewPiece.type;
	dropingPiece.state = nextPreviewPiece.currentState;
}

function draw(){
	updateScreen();
	autoDrop();
	window.requestAnimationFrame(draw);
}

function drawNext(){
	let padding = (nextSize - movingPieceSize) / 2;
	nctx.save();
	let startPointX = padding;
	let startPointY = padding;
	nctx.translate(startPointX,startPointY);
	nextPreviewPiece.currentState = nextPiece.currentState;
	nextPreviewPiece.type = nextPiece.type;
	nextPreviewPiece.location = {x: startPointX,
								y:startPointY };
	nctx.clearRect(startPointX,startPointY,
		movingPieceSize,movingPieceSize);
	drawPiece(nextPreviewPiece,nctx);
	nctx.restore();	
}

function rotate(){
	for(let i = 0;i < movingPieceSize;i++){
		for(let j = 0;j < movingPieceSize;j++){
			let globalX = dropingPiece.location.x + i;
			let globalY = dropingPiece.location.y + j;
			if(globalRecords[globalX * screenWidth + globalY] != Color.white){
				let color = "white";
				if((0x8000 >> (i *movingPieceSize + j) & dropingPiece.state)){
					color = dropingPiece.type.color;
				}
				drawBlock(globalX,globalY,color);
			}
		}
	}
	onGroundCheck();
}

function move(inputDirection){
	switch(inputDirection){
		case moveDirections.LEFT:
			if(moveValid(-1,0)){
				shiftChangeColorBuffer(-1,0);
			}
			break;
			
		case moveDirections.RIGHT: 	
			if(moveValid(1,0)){
				shiftChangeColorBuffer(1,0);
			}
			break;   
		
		case moveDirections.DOWN: 	
			if(moveValid(0,1)){
				shiftChangeColorBuffer(0,1);
			}
		}
		onGroundCheck();
}

function shiftChangeColorBuffer(changeX,chnageY){
	let oldPosX = dropingPiece.location.x;
	let oldPosY = dropingPiece.location.y;
	dropingPiece.location.x += changeX;
	dropingPiece.location.y += chnageY;
	for(let i = 0;i < movingPieceSize;i++){
		for(let j = 0;j < movingPieceSize;j++){
			newColor = "white";
			if((0x8000 >> (i * movingPieceSize + j)) & dropingPiece.state){
				newColor = dropingPiece.type.color;
			}
			drawBlock(oldPosX + i,oldPosY + j,newColor);
			drawBlock(dropingPiece.location.x + i,dropingPiece.location.y + j,newColor);
		}
	}
}

function moveValid(changeX,changeY){
	let expectedX = dropingPiece.location.x + changeX;
	let expectedY = dropingPiece.location.y + changeY;
	let valid = true;
	for(let i = 0;i < movingPieceSize;i++){//rows
		for(let j = 0;j < movingPieceSize;j++){	//columns
			let detectLoc =  (expectedX + i) * screenWidth + (j + expectedY);
			let pieceBlockFull = (0x8000 >> (i * movingPieceSize + j) & dropingPiece.state);	
			let globalRecordsFull = globalRecords[detectLoc]
			if(globalRecordsFull &&  pieceBlockFull){
				valid = false;
			}
	return valid;
        }
    }
}

function cleanLines(dropingPieceX,dropingPieceY){
	for(let i = movingPieceSize + dropingPieceX - 1;i >= dropingPieceX ;i--){
		let j;
		for(j = 0;j < screenWidth;j++){
			if(globalRecords[i * screenWidth + j] == Color.white){
				break;
			}
		}
		if(j == screenWidth){
			for(j = 0;j < screenWidth;j++){
				newColor = 'white';
				globalRecords[i * screenWidth + j] = globalRecords[(i - 1) * screenWidth + j];
				drawBlock(i,j,numColor2Str(globalRecords[(i - 1) * screenWidth + j]))
				score += 10;
			}
		}
	}
	
}
function onGroundCheck(){
	let onGround = moveValid(0,1);	
	if(onGround){
		for(let i = 0;i < movingPieceSize;i++){
			for(let j = 0;j < movingPieceSize;j++){
				if((0x8000 >> (i * movingPieceSize + j)) & dropingPiece.state){
					let globalX = dropingPiece.location.x + i;
					let globalY = dropingPiece.location.y + j;
					globalRecords[globalX * screenWidth + screenHeight] = strColor2Num(dropingPiece.type.color);
				}
			}
		}
		cleanLines(dropingPiece.location.x,dropingPiece.location.y);
	}
	return onGround;
}

function strColor2Num(strColor){
	colorNum = Color.white;
	if(strColor == "red"){ colorNum = Color.red;}
	else if(strColor == "blue"){colorNum = Color.blue;}
	else if(strColor == "green"){colorNum = Color.green;}
	else if(strColor == "yellow"){colorNum = Color.yellow;}
	else if(strColor == "navy"){colorNum = Color.navy;}
	else if(strColor == "maroon"){colorNum = Color.maroon;}
	return colorNum;
}

function numColor2Str(numColor){
	strColor = "white";
	if(numColor == 1){ strColor = "red"; }
	else if(numColor == 2){ strColor = "blue";}
	else if(numColor == 3){ strColor = "green";}
	else if(numColor == 4){ strColor = "yellow";}
	else if(numColor == 5){ strColor = "navy";}
	else if(numColor == 6){ strColor = "maroon";}
	return strColor;
}

function drawPiece(pieceTarget,context){
	let x = pieceTarget.location.x;
	let y = pieceTarget.location.y;
	let color = pieceTarget.type.color;
	let state = pieceTarget.currentState;
	let initPos = 0x8000;
	for(let i = 0;i< 16;i++){
		if(initPos & state){
			let drawX = (i / 4) + x;
			let drawY = (i % 4) + y;
			drawBlock(drawX,drawY,color);
		}
		initPos >> 1;
	}
}

function drawBlock(x,y,color){
	context.fillStyle = color;
	let lengthX = x * blockWidth;
	let lengthY = y * blockHeight;
	//context.save();
	context.fillRect(lengthX,lengthY,blockWidth,blockHeight);
	if(color !== 'white'){
		context.strokeRect(lengthX,lengthY,blockWidth,blockHeight);
	}
	//context.restore();
}

function initGlobalRecords(){
	for(let i = 0;i < screenHeight;i++){
		for(let j = 0;j < screenWidth;j++){
			globalRecords[i * screenWidth + j] = Color.white;
		}
	}
}

