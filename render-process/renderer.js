'use strict'


//constants
const canvas = document.getElementById('canvas'),
	context = canvas.getContext('2d');
const nextCanvas = document.getElementById('next_canvas'),
	nctx = nextCanvas.getContext('2d');

const controlKeys = {left: "ArrowLeft",right: "ArrowRight" ,up: "ArrowUp",down: "ArrowDown",esc: "Escape"};
const moveDirections = {LEFT:0,
					RIGHT:1,
					UP:2,
					DOWN:3};

const screenHeight = 50;//use block number to measure it
const screenWidth = 20;
const nextSize = 5;
const movingPieceSize = 4;

//use 16 bits to measure the pieces' shape,and present them in HEX 
//convert the bits of the first line to the first HEX number,and so as others
//the state of each block shows the initial state and rotation after 90,180,270 degrees' rotate
const shape31 = {state: [0x88C0,0x7400,0x0311,0x002E],color: 'red'}
const shape13 = {state: [0x44C0,0x4700,0x0622,0x00E2],color: 'blue'}
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
var topPieceVertexPerX = new Int32Array(4);
var score = 0;
var nextPreviewPiece = {};
var now;
var last;
var drawpieceTimes = 0;//debug
var highestBuffer = screenHeight;

//variables for next piece preview
var nextChange = [];

var globalRecords = new Int32Array(screenWidth * screenHeight);


//controller part
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
		if (event.key == controlKeys.esc){
			lose()
			handled =true;
		}
	}
	else if (event.key == ' '){
		startPlay();
		handled = true;
	}
	if(handled){
		event.preventDefault();
	}
}

//for game logic
function startPlay(){
	let title = document.getElementById('start');
	title.style.visibility = 'hidden';
	reset();
	playing = true;
	dropNext();
}

function draw(){
	updateScreen();
	autoDrop();
	window.requestAnimationFrame(draw);
}

function lose(){
	let title = document.getElementById('start');
	title.style.visibility = 'visible';
	reset();
	updateScreen();
	playing = false;
}

function resize(event){
	blockWidth = canvas.width / screenWidth;
	blockHeight = canvas.height / screenHeight;
}

function timestamp(){
	return new Date().getTime();
}

function autoDrop(){
	if(playing){
		now = timestamp();
		let dropLength = Math.min(1,(now - last)/1000);
		if(dropLength < 1){
			return;
		}
		for(let i = 0;i < dropLength;i++){
			move(moveDirections.DOWN);
		}
		last = now;
	}
}

function reset(){
	score = 0;
	context.clearRect(0,0,context.width,context.height);
	randomChooseNext();
	for(let i = 0;i < screenHeight;i++){
		for(let j = 0;j < screenWidth;j++){
			drawBlock(i,j,"white");
			globalRecords[i * screenWidth + j] = Color.white;
		}
	}
	changedTarget = [];
}

function randomChooseNext(){
	let randomNum = Math.random();
	nextPiece.location = {};
	nextPiece.location.x = Math.floor(randomNum * (screenWidth - movingPieceSize));
	nextPiece.location.y = 0;
	let type = Math.floor(randomNum * Pieces.length);
	nextPiece.type = Pieces[type];
	nextPiece.currentStateNum = 0;
}

function dropNext(){
	drawNext();
	randomChooseNext();
	dropingPiece.location = nextPreviewPiece.location;
	dropingPiece.type = nextPreviewPiece.type;
	dropingPiece.stateNum = nextPreviewPiece.currentStateNum;
}

//moving and changing
function rotate(){
	dropingPiece.stateNum = (dropingPiece.stateNum + 1) % 4;
	for(let i = 0;i < movingPieceSize;i++){
		for(let j = 0;j < movingPieceSize;j++){
			let globalX = dropingPiece.location.x + i;
			let globalY = dropingPiece.location.y + j;
			if(globalRecords[globalX * screenWidth + globalY] != 0){
				if((0x8000 >> (i *movingPieceSize + j) & dropingPiece.type.state[dropingPiece.stateNum])){
					return;
				}
			}
		}
	}
	//update piece
	for(let i = 0;i < movingPieceSize;i++){
		for(let j = 0;j < movingPieceSize;j++){
			let globalX = dropingPiece.location.x + i;
			let globalY = dropingPiece.location.y + j;
			newColor = "white";
			if((0x8000 >> (i * movingPieceSize + j)) & dropingPiece.type.state[dropingPiece.stateNum]){
				newColor = dropingPiece.type.color;
			}
			if(globalRecords[(globalY + i) * screenWidth + (globalX + j)] == 0){
				drawBlock(dropingPiece.location.x + j,dropingPiece.location.y + i,newColor);
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

//for canvas drawing
function drawNext(){
	let padding = (nextSize - movingPieceSize) / 2;
	nctx.save();
	let startPointX = Math.round(padding);
	let startPointY = Math.round(padding);
	nctx.translate(startPointX,startPointY);
	nextPreviewPiece.currentStateNum = nextPiece.currentStateNum;
	nextPreviewPiece.type = nextPiece.type;
	nextPreviewPiece.location = {x: startPointX,
								y:startPointY };
	nctx.clearRect(startPointX,startPointY,
		movingPieceSize,movingPieceSize);
	drawPiece(nextPreviewPiece);
	nctx.restore();	
}

function updateScreen(){
	newChange = changedTarget.slice(0);
	changedTarget = [];
	context.save();
	newChange.forEach((item,index,array) => {
		renderBlock(item,context);
	});
	context.restore();
}


function shiftChangeColorBuffer(changeX,changeY){
	let oldPosX = dropingPiece.location.x;
	let oldPosY = dropingPiece.location.y;
	dropingPiece.location.x += changeX;
	dropingPiece.location.y += changeY;
	for(let i = 0;i < movingPieceSize;i++){
		for(let j = 0;j < movingPieceSize;j++){
			if((0x8000 >> (i * movingPieceSize + j)) & 
				dropingPiece.type.state[dropingPiece.stateNum]){
				if(globalRecords[(oldPosY + i) * screenWidth + (oldPosX + j)] == 0){
					drawBlock(oldPosX + j,oldPosY + i,"white");
				}
			}
		}
	}
	let newColor = dropingPiece.type.color;
	for(let i = movingPieceSize - 1;i >= 0;i--){
		for(let j = 0;j < movingPieceSize;j++){
			if((0x8000 >> (i * movingPieceSize + j)) & dropingPiece.type.state[dropingPiece.stateNum]){
				drawBlock(dropingPiece.location.x + j,dropingPiece.location.y + i,newColor);
			}			
		}
	}

}

function moveValid(changeX,changeY){
	let expectedX = dropingPiece.location.x + changeX;
	let expectedY = dropingPiece.location.y + changeY;
	let valid = true;
	if(expectedX >= screenWidth ||
		expectedX < -2 || 
		expectedY >= screenHeight ||
		expectedY < 0){
		return false;
	}
	for(let i = movingPieceSize - 1;i >= 0;i--){//rows
		for(let j = 0;j < movingPieceSize;j++){	//columns
			let detectX = expectedX + j;
			let detectY = i + expectedY;
			let detectLoc =  detectX + detectY * screenWidth;
			let pieceBlockFull = (0x8000 >> (i * movingPieceSize + j) & dropingPiece.type.state[dropingPiece.stateNum]);
			if(detectLoc >= screenWidth * screenHeight || 
				detectY >= screenHeight ||
				detectY < 0 ||
				detectX >= screenWidth||
				detectX < 0
				){
				if(pieceBlockFull){
					return false;
				}
				continue;	
			}

			let globalRecordsFull = globalRecords[detectLoc];	
			if(globalRecordsFull &&  pieceBlockFull){
				valid = false;
			}
        }
    }
    return valid;
}

function onGroundCheck(){
	let notOnGround = moveValid(0,1);	
	if(!notOnGround){
		for(let i = 0;i < movingPieceSize;i++){
			for(let j = 0;j < movingPieceSize;j++){
				if((0x8000 >> (i * movingPieceSize + j)) & dropingPiece.type.state[dropingPiece.stateNum]){
					let globalX = dropingPiece.location.x + j;
					let globalY = dropingPiece.location.y + i;
					globalRecords[globalY * screenWidth + globalX] = strColor2Num(dropingPiece.type.color);
					drawBlock(globalX,globalY,dropingPiece.type.color);
				}
			}
		}
		cleanLines(dropingPiece.location.x,dropingPiece.location.y + 1);
		dropNext();
	}
	return !notOnGround;
}


function cleanLines(dropingPieceX,dropingPieceY){
	for(let i = Math.min(movingPieceSize + dropingPieceY - 1,screenHeight - 1);i >= dropingPieceY ;i--){
		let j;
		for(j = 0;j < screenWidth;j++){
			if(globalRecords[i * screenWidth + j] == 0){
				break;
			}
		}
		if(j == screenWidth){
			//move down line
			moveLineDown(i-1);
			score += 10;
		}
	}
	updateScreenByBuffer();
}

function moveLineDown(lineNum){
	for(let i = lineNum;i >= 0;i--){
		for(let j = 0;j < screenWidth;j++){
			globalRecords[(i + 1) * screenWidth + j] = globalRecords[i * screenWidth + j];
		}
	}
}

function updateScreenByBuffer(){
	for(let i = 0;i < screenHeight;i++){
		for(let j = 0;j < screenWidth;j++){
			drawBlock(i,j,numColor2Str(globalRecords[i * screenWidth + j]));
		}
	}
}

function strColor2Num(strColor){
	let colorNum = Color.white;
	if(strColor == "red"){ colorNum = Color.red;}
	else if(strColor == "blue"){colorNum = Color.blue;}
	else if(strColor == "green"){colorNum = Color.green;}
	else if(strColor == "yellow"){colorNum = Color.yellow;}
	else if(strColor == "navy"){colorNum = Color.navy;}
	else if(strColor == "maroon"){colorNum = Color.maroon;}
	return colorNum;
}

function numColor2Str(numColor){
	let strColor = "white";
	if(numColor == 1){ strColor = "red"; }
	else if(numColor == 2){ strColor = "blue";}
	else if(numColor == 3){ strColor = "green";}
	else if(numColor == 4){ strColor = "yellow";}
	else if(numColor == 5){ strColor = "navy";}
	else if(numColor == 6){ strColor = "maroon";}
	return strColor;
}

function drawPiece(pieceTarget){
	drawpieceTimes += 1;
	let x = pieceTarget.location.x;
	let y = pieceTarget.location.y;
	let color = pieceTarget.type.color;
	let state = pieceTarget.type.state[pieceTarget.currentStateNum];
	let initPos = 0x8000;
	for(let i = 0;i< 16;i++){
		if(initPos & state){
			let drawX = (i / 4) + x;
			let drawY = (i % 4) + y;
			renderBlock({x:drawX,y:drawY,color:color},nctx);
		}
		initPos >> 1;
	}
}

function renderBlock(item,canvasContext){
	canvasContext.fillStyle = item.color;
	let lengthX = item.x * blockWidth;
	let lengthY = item.y * blockHeight;
	//context.save();
	canvasContext.clearRect(lengthX,lengthY,blockWidth,blockHeight);
	canvasContext.fillRect(lengthX,lengthY,blockWidth,blockHeight);
	/*if(item.color !== 'white'){
		canvasContext.strokeRect(lengthX,lengthY,blockWidth,blockHeight);
	}*/
}
function drawBlock(x,y,color){
	let item = {};
	item.x = x;
	item.y = y;
	item.color = color;
	changedTarget.push(item);
}

function initGlobalRecords(){
	for(let i = 0;i < screenHeight;i++){
		for(let j = 0;j < screenWidth;j++){
			globalRecords[i * screenWidth + j] = Color.white;
		}
	}
}

exports.resize = resize;
exports.reset = reset;
exports.draw = draw;
exports.dropNext = dropNext;
exports.keydown = keydown;