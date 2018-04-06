'use strict'

var constant = require(./constant);
var constant = require(./constant);

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
		renderBlock(item);
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

function renderBlock(item){
	context.fillStyle = color;
	let lengthX = x * blockWidth;
	let lengthY = y * blockHeight;
	//context.save();
	context.fillRect(lengthX,lengthY,blockWidth,blockHeight);
	if(color !== 'white'){
		context.strokeRect(lengthX,lengthY,blockWidth,blockHeight);
	}
	//todo -make some change
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
	//todo - push it to buffer
	//context.restore();
}


function initGlobalRecords(){
	for(let i = 0;i < screenHeight;i++){
		for(let j = 0;j < screenWidth;j++){
			globalRecords[i * screenWidth + j] = Color.white;
		}
	}
}

