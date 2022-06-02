
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
var box = [], boxObj =[], boxScheme, path;
var padding = 3;
var rows, cols, totalBoxes, eachBox;

document.getElementById('btn').addEventListener("click", function(){
	const level = document.getElementById('input').value;
	rows = global_trace_data[level].heightNum;
	cols = global_trace_data[level].widthNum;
	path = global_trace_data[level].cellData;
	totalBoxes = rows*cols;
	xxxx();
	canvasSize();
	fillDefault();
	addBoxObjects();
	//drawBoard();

	console.log(rows);
	console.log(cols);
	console.log(path);
});
// rows = 8;
// cols = 6;
// path = [40, 41, 47, 46, 45, 39, 38, 44, 43, 42, 36, 30, 24, 18, 12, 6, 0, 1, 7, 8, 2, 3, 9, 10, 4, 5, 11, 17, 16, 22, 21, 15, 14, 20, 19, 25, 31, 32, 26, 27, 33, 34, 28, 29];
// totalBoxes = rows*cols;
// xxxx();
// canvasSize();
// fillDefault();
// addBoxObjects();
// drawBoard();

function xxxx(){
	boxScheme = new Array(totalBoxes);
	boxScheme.fill(0);
	for(var i=0; i<path.length; i++){
		for(var j=0; j<totalBoxes; j++){
			if(path[i] == j){
				boxScheme[j] = 1;
			}
		}
	}
};

function canvasSize(){
	const display_width = document.getElementById('display').offsetWidth;
	const display_height = document.getElementById('display').offsetHeight;

	const margin_px = 60;
	var maxi = Math.max(rows,cols);
	if (display_width > display_height){//landscape
		const min_height = display_height - margin_px - (maxi*padding);
		eachBox = Math.floor(parseInt(min_height)/parseInt(maxi));
	}
	else{
		const min_width = display_width - margin_px - (maxi*padding);
		eachBox = Math.floor(min_width / maxi);
	}

	canvas.width = (eachBox+padding)*cols + padding;
	canvas.height = (eachBox+padding)*rows + padding;
}

function fillDefault(){
	let x = padding, y = padding;
	for(let i=0; i<totalBoxes; i++){
		box[i] = new Path2D();
		box[i].rect(x, y, eachBox, eachBox);
		if(boxScheme[i] == 0)
			ctx.fillStyle = 'grey';
		else
			ctx.fillStyle = 'green';

		ctx.fill(box[i]);
		if(i%cols == cols-1){
			y += eachBox+padding;
			x = padding;
		}
		else
			x += eachBox+padding;
	}
	ctx.fillStyle = 'blue';
	ctx.fill(box[path[0]]);
	// ctx.fillStyle = 'violet';
	// ctx.fill(box[path[path.length-1]]);
}


function addBoxObjects(){
	var index = 0;
	for(let i=0; i<rows; i++){
		for(let j=0; j<cols; j++) {
			var obj = {left:-1, up:-1, right:-1, down:-1, x: padding +  eachBox/2, y: padding +  eachBox/2}
			if(j < cols-1)
				obj.right = index+1;
			if(j > 0)
				obj.left = index-1;
			if(i < rows-1)
				obj.down = index+cols;
			if(i > 0)
				obj.up = index-cols;
			obj.x += (padding + eachBox)*j;
			obj.y += (padding + eachBox)*i;
			boxObj[index] = obj;
			index++;
		}
	}
	//console.log(boxObj);
}

function drawBoard(){
	console.log('draw');
	for(let i=1; i<path.length; i++){
		ctx.beginPath();
		ctx.setLineDash([7, 7]);
		ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'antiquewhite';
        ctx.lineWidth = 3;
		ctx.moveTo(boxObj[path[i-1]].x, boxObj[path[i-1]].y);
		ctx.lineTo(boxObj[path[i]].x, boxObj[path[i]].y);
		ctx.stroke();
		ctx.closePath();
	}
}
