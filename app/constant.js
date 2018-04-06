
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
