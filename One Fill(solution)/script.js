const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
var box = [], boxObj =[], boxScheme, path;
var padding = 3;
var rows, cols, totalBoxes, eachBox;
var startPosition, blockBoxes;
var gotStartPosition = false, gotBlockBoxes = false;

document.getElementById('get-ratio').addEventListener('click', function(){
	rows = parseInt(document.getElementById('rows').value);
	cols = parseInt(document.getElementById('cols').value);
	totalBoxes = rows*cols;
	canvasSize();
	fillDefault();
	document.getElementById('ratio').style.display = 'none';
	document.getElementById('start-pos').style.display = 'block';
	console.log("rows: "+rows+", cols: "+cols);
	getStartPosition();
});

document.getElementById('get-start').addEventListener('click', function(){
	document.getElementById('start-pos').style.display = 'none';
	document.getElementById('block-boxes').style.display = 'block';
	gotStartPosition = true;
	getBlockBoxes();
	console.log("start position: "+ startPosition);
});

document.getElementById('get-blocks').addEventListener('click', function(){
	document.getElementById('block-boxes').style.display = 'none';
	document.getElementById('solution').style.display = 'block';
	gotBlockBoxes = true;
	console.log("block-boxes:"+blockBoxes);

});

document.getElementById('generate').addEventListener('click', function(){
	document.getElementById('solution').style.display = 'none';
	algorithm();
});

function canvasSize(){
	const display_width = document.getElementById('display').offsetWidth;
	const display_height = document.getElementById('display').offsetHeight;

	const margin_px = 100;
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
	ctx.fill(box[0]);
}

function boxIndexFinder(x, y){
	for(let i=0; i<totalBoxes; i++)
		if(ctx.isPointInPath(box[i], x, y))
	    	return i;
}

function getStartPosition(){
	var isMouseDown = false;
	var currentIndex;
	var lastPosition = 0;
	startPosition = lastPosition;
	canvas.addEventListener('mousedown', function(codi) {
		currentIndex = boxIndexFinder(codi.offsetX, codi.offsetY);
		if(currentIndex == lastPosition && !gotStartPosition){
			isMouseDown = true;
		}
	});

	canvas.addEventListener('mousemove', function(codi) {
		if(isMouseDown){
			currentIndex = boxIndexFinder(codi.offsetX, codi.offsetY);
			if (currentIndex != undefined && currentIndex != lastPosition){
				ctx.fillStyle = 'green';
				ctx.fill(box[lastPosition]);
				ctx.fillStyle = 'blue';
				ctx.fill(box[currentIndex]);
				lastPosition = currentIndex;
			}
		}
	});
	canvas.addEventListener('mouseup', function(){
		if(isMouseDown)
			isMouseDown = false;
		startPosition = lastPosition;
	});
}

function getBlockBoxes(){
	var array = new Array;
	var currentIndex, remove;
	canvas.addEventListener('dblclick', function(codi){
		currentIndex = boxIndexFinder(codi.offsetX, codi.offsetY);
		remove = false;
		if(currentIndex != startPosition && gotBlockBoxes != true){
			for(let i=0; i<array.length;i++){
				if(currentIndex == array[i]){
					array.splice(i, 1);
					remove = true;
					break;
				}
			}
			if(remove){
				ctx.fillStyle = 'green';
				ctx.fill(box[currentIndex]);
			}
			else{
				ctx.fillStyle = 'grey';
				ctx.fill(box[currentIndex]);
				array.push(currentIndex);
			}
			blockBoxes = array;
		}
		
	});
}


var boxScheme, edges = [], graph;
var winPosition;
function algorithm(){

	getBoxScheme();
	getEdges();
	getGraph();
	var hamiltonian = new HamiltonianCycle();
	hamiltonian.hamCycle(graph);
	drawBoard(hamiltonian);

	console.log(hamiltonian.path);
}

function getBoxScheme(){
	boxScheme = new Array(totalBoxes+1);
	boxScheme.fill(1);
	for(let i=0; i<blockBoxes.length; i++){
		for(let j=0; j<totalBoxes;j++){
			if(blockBoxes[i] == j){
				boxScheme[j] = 0;
				break;
			}
		}
	}
}

function getEdges(){
	var index = 0;
	for(let i=0; i<rows; i++){
		for(let j=0; j<cols; j++) {
			var array = new Array;
			if(boxScheme[index] != 0){
				if(j < cols-1 && boxScheme[index+1] != 0)
					array.push(index+1);
				if(j > 0 && boxScheme[index-1] != 0)
					array.push(index-1);
				if(i < rows-1 && boxScheme[index+cols] != 0)
					array.push(index+cols);
				if(i > 0 && boxScheme[index-cols] != 0) 
					array.push(index-cols);
				if(array.length == 1) {
					winPosition = index;
					array.push(totalBoxes);
				}
				edges[index] = array;
			}
			else edges[index] = -1;
			index++;
		}
	}
	edges[startPosition].push(totalBoxes);
	edges[index] = [startPosition, winPosition];//adding a node to connect start and win positions
}

function getGraph(){
	graph = new Array;
	for(let i=0; i<totalBoxes+1; i++){
		var array = new Array(totalBoxes+1).fill(0);
		if(edges[i] != -1){
			array = generateGraph(array, i);
		}
		graph.push(array);
	}
}

function generateGraph(arr, node){
	for(let i=0; i<edges[node].length; i++){
		for(let j=0; j<arr.length; j++){
			if(edges[node][i] == j){
				arr[j] = 1;
				break;
			}
		}
	}
	return arr;
}

class HamiltonianCycle {
	constructor() {
		this.totalNodes = graph.length;
		this.path = [];
	}

	checkPath(node, graph, path, pathIndex) {
		if (graph[path[pathIndex - 1]][node] == 0)//checking if the previous node is connected with current node
			return false;

		for (var i = 0; i < pathIndex; i++)//checking the whole path
			if (path[i] == node)
				return false;

		return true;
	}

	findPath(graph, path, pathIndex) {
		var holes = blockBoxes.length;
		if (pathIndex == this.totalNodes - holes) {//the end of the hamiltonian path(fake node)
			if (graph[path[pathIndex - 1]][path[0]] == 1)//Is the last node connecting with the first node?
				return true;
			else
				return false;
		}
		var prevIndex = path[pathIndex-1];
		for (var i = 0; i < edges[prevIndex].length; i++) {//just checking neighbors of last node(not all)
			var node = edges[prevIndex][i];//current node
			if (this.checkPath(node, graph, path, pathIndex)) {//checking if current node is in the path
				path[pathIndex] = node;//adding node to path
				if (this.findPath(graph, path, pathIndex + 1) == true)//recursion return true
					return true;
				path[pathIndex] = -1;
			}
		}
		return false;
	}

	hamCycle(graph) {
		this.path = new Array(this.totalNodes).fill(-1);
		this.path[0] = startPosition;
		if (this.findPath(graph, this.path, 1) == false) {
			document.write("<br>Solution does not exist");
			return 0;
		}
		return 1;
	}
}

function drawBoard(solution){
	console.log('draw');
	var index = 0;
	var codiXY = [];
	for(let i=0; i<rows; i++){
		for(let j=0; j<cols; j++) {
			var codi = {x: padding +  eachBox/2, y: padding +  eachBox/2};
			codi.x += (padding + eachBox)*j;
			codi.y += (padding + eachBox)*i;
			codiXY[index] = codi;
			index++;
		}
	}
	var path = solution.path;
	var realLength = path.length - 1 - blockBoxes.length;
	for(let i=1; i<realLength; i++){
		ctx.beginPath();
		ctx.setLineDash([7, 7]);
		ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'antiquewhite';
        ctx.lineWidth = 3;
		ctx.moveTo(codiXY[path[i-1]].x, codiXY[path[i-1]].y);
		ctx.lineTo(codiXY[path[i]].x, codiXY[path[i]].y);
		ctx.stroke();
		ctx.closePath();
	}
}

