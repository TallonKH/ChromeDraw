// TODO
// Fill
// Shape Tools
// Dropper
// Multiple color inputs

const urlParams = new URL(window.location.href).searchParams;
const can = document.getElementById("can");
const overlay = document.getElementById("overlay");
const colorP = document.getElementById("colorPicker1");
const widthP = document.getElementById("widthPicker");
const widthS = document.getElementById("widthSlider");
const alphaP = document.getElementById("alphaPicker");
const alphaS = document.getElementById("alphaSlider");
const densityP = document.getElementById("densityValPicker");
const densityS = document.getElementById("densityValSlider");
const outImg = document.getElementById("img");
const undoButton = document.getElementById("undoButton");
const redoButton = document.getElementById("redoButton");
const fillAllButton = document.getElementById("fillAllButton");
const ctx = can.getContext("2d");
const octx = overlay.getContext("2d");
const standardChunkSize = 64;

let maxUndoCount = 10;
let currentHitPixels = null;
let drawWidth = parseInt(widthP.value);
let alpha1 = 255;
let densityVal = 1;
let color1 = [0, 0, 0, alpha1];
let mouseDown = false;
let shiftDown = false;
let optionDown = false;
let controlDown = false;
let pressInCanvas = false;
let metaDown = false;
let mcsX = 0; // mouse canvas X
let mcsY = 0;
let prevMcsX = 0;
let prevMcsY = 0;
let imgWidth = can.width;
let imgHeight = can.height;
let workingImgData = ctx.getImageData(0, 0, imgWidth, imgHeight);
let currentState = null;
let stateChanged = true;
let brushPixels = [];

ctx.imageSmoothingEnabled = false;

outImg.addEventListener("mouseover", function (e) {
	outImg.src = can.toDataURL();
});

colorP.addEventListener("change", function (e) {
	color1 = hexToColor(colorP.value, alpha1);
});

alphaP.addEventListener("change", function (e) {
	alpha1 = parseInt(alphaP.value);
	color1[3] = alpha1;
	alphaS.value = alpha1;
});

alphaS.addEventListener("input", function (e) {
	alpha1 = parseInt(alphaS.value);
	color1[3] = alpha1;
	alphaP.value = alpha1;
});

densityP.addEventListener("change", function (e) {
	densityVal = parseFloat(densityP.value);
	densityS.value = densityVal;
});

densityS.addEventListener("input", function (e) {
	densityVal = parseFloat(densityS.value);
	densityP.value = densityVal;
});

widthP.addEventListener("change", function (e) {
	drawWidth = parseInt(widthP.value);
	widthS.value = widthP.value;
});

widthS.addEventListener("input", function (e) {
	drawWidth = parseInt(widthS.value);
	widthP.value = drawWidth;
});

document.addEventListener("keydown", function (e) {
	switch (e.key) {
		case "Shift":
			shiftDown = true;
			break;
		case "Meta":
			metaDown = true;
			break;
		case "Alt":
			altDown = true;
			break;
		case "Control":
			controlDown = true;
			break;
		case "z":
			if (metaDown || controlDown) {
				if (shiftDown) {
					redoState();
					e.preventDefault();
				} else {
					undoState();
					e.preventDefault();
				}
			}
			break;
		case "y":
			if (metaDown || controlDown) {
				redoState();
				e.preventDefault();
			}
			break;
	}
});

document.addEventListener("keyup", function (e) {
	switch (e.key) {
		case "Shift":
			shiftDown = false;
			break;
		case "Meta":
			metaDown = false;
			break;
		case "Alt":
			altDown = false;
			break;
		case "Control":
			controlDown = false;
			break;
	}
});

function drawModeChanged(self) {
	drawMode = self.value;
}

// {
// 	let drawModeRadios = drawModeR.children;
// 	for (let i = 0; i < drawModeRadios.length; i++) {
// 		const child = drawModeRadios[i];
// 		if (child.nodeName == "INPUT") {
// 			child.addEventListener("change", function(e) {
// 				drawModeChanged(child);
// 			};
// 		}
// 	}
// }

function fillAll() {
	for (let x = 0; x < imgWidth; x++) {
		for (let y = 0; y < imgHeight; y++) {
			const i = (y * imgWidth + x) * 4;
			setPixelI(workingImgData, i, typeChain[2].func(getPixelI(workingImgData, i), typeChain[3].func(x, y, x, y), 1));
		}
	}
	changeImage(workingImgData);
}

fillAllButton.addEventListener("click", function (e) {
	fillAll();
	saveState();
});

function makeGrid(len, val) {
	const grid = new Array(len);
	for (let i = 0; i < len; i++) {
		const r = new Array(len);
		r.fill(val);
		grid[i] = r;
	}
	return grid;
}

function bGridMake(chunkSize) {
	return {
		'chunkSize': chunkSize
	};
}

function hashCoord(x, y) {
	x = Math.floor(x);
	y = Math.floor(y);
	if (x < 0 || x > 32767 || y < 0 || y > 32767) {
		return "UNHASHABLE COORDINATES: " + x + ", " + y;
	}
	return (x << 16) | y;
}

function bGridGet(grid, x, y) {
	const sz = grid['chunkSize'];
	const chunk = grid[hashCoord(x / sz, y / sz)];
	if (chunk) {
		return chunk[x % sz][y % sz];
	}
	return false;
}

function bGridSet(grid, x, y, val) {
	const sz = grid['chunkSize'];
	const coord = hashCoord(x / sz, y / sz);
	let chunk = grid[coord];
	const x1 = x % sz;
	const y1 = y % sz;
	if (chunk) {
		prev = chunk[x1][y1];
		chunk[x1][y1] = val;
	} else {
		chunk = makeGrid(sz, false);
		chunk[x1][y1] = val;
		grid[coord] = chunk;
	}
}

// if a cell is false, run an action on it and set it to true if the action returns truthy
function bGridDo(grid, x, y, func) {
	const sz = grid['chunkSize'];
	const coord = hashCoord(x / sz, y / sz);
	let chunk = grid[coord];
	const x2 = x % sz;
	const y2 = y % sz;
	if (chunk) {
		if (!chunk[x2][y2] && func()) {
			chunk[x2][y2] = true;
			return true;
		}
	} else {
		if (func()) {
			chunk = makeGrid(sz, false);
			chunk[x2][y2] = true;
			grid[coord] = chunk;
			return true;
		}
	}
	return false;
}

function bGridIf(grid, x, y, success, fail) {
	const sz = grid['chunkSize'];
	const coord = hashCoord(x / sz, y / sz);
	let chunk = grid[coord];
	const x2 = x % sz;
	const y2 = y % sz;
	if (chunk) {
		if (!chunk[x2][y2]) {
			chunk[x2][y2] = true;
			return success;
		}
	} else {
		chunk = makeGrid(sz, false);
		chunk[x2][y2] = true;
		grid[coord] = chunk;
		return success;
	}
	return fail;
}

function hexToColor(hex, alpha) {
	return [parseInt(hex.substring(1, 3), 16), parseInt(hex.substring(3, 5), 16), parseInt(hex.substring(5, 7), 16), alpha];
}

function toIndex(x, y) {
	return ((y * (imgWidth * 4)) + (x * 4));
}

function getPixelI(imgData, rIndex) {
	return [imgData.data[rIndex], imgData.data[rIndex + 1], imgData.data[rIndex + 2], imgData.data[rIndex + 3]];
}

function getPixel(imgData, x, y) {
	return getPixelI(imgData, toIndex(imgData.width, x, y));
}

function setPixelI(imgData, rIndex, color) {
	imgData.data[rIndex] = color[0];
	imgData.data[rIndex + 1] = color[1];
	imgData.data[rIndex + 2] = color[2];
	imgData.data[rIndex + 3] = color[3];
}

function setPixel(imgData, x, y, color) {
	return setPixelI(imgData, toIndex(x, y), color);
}

function editPixel(imgData, x, y, func) {
	const rIndex = toIndex(x, y);
	setPixelI(imgData, rIndex, func(getPixelI(imgData, rIndex)));
}

function lineTo(x1, y1, x2, y2, func) {
	const xDif = x2 - x1;
	const yDif = y2 - y1;
	const steps = Math.max(Math.abs(xDif), Math.abs(yDif));
	const xStep = xDif / steps;
	const yStep = yDif / steps;
	for (let i = 0; i <= steps; i++) {
		const x = Math.floor(x1 + i * xStep);
		const y = Math.floor(y1 + i * yStep);
		if (x > 0 && x < imgWidth && y > 0 && y < imgHeight) {
			func(x, y);
		}
	}
}

function lerp(a, b, mix) {
	return a * (1 - mix) + b * mix;
}

function cClamp(color) {
	return [Math.min(255, Math.max(0, color[0])), Math.min(255, Math.max(0, color[1])), Math.min(255, Math.max(0, color[2])), Math.min(255, Math.max(0, color[3]))];
}

function randColor() {
	return [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), 255];
}

function ring(x, y, r, func) {
	const r2 = r * r;
	for (let yy = -Math.max(y - Math.max(0, y - r), Math.min(imgHeight, y + r) - y); yy < 0; yy++) {
		const xw = Math.floor(Math.sqrt(r2 - (yy * yy)));
		func(x + xw, y + yy);
		func(x + xw, y - yy);
		func(x - xw, y + yy);
		func(x - xw, y - yy);
	}
	for (let xx = -Math.max(x - Math.max(0, x - r), Math.min(imgHeight, x + r) - y); xx < 0; xx++) {
		const yw = Math.floor(Math.sqrt(r2 - (xx * xx)));
		func(x + xx, y + yw);
		func(x + xx, y - yw);
		func(x - xx, y + yw);
		func(x - xx, y - yw);
	}
}

function clamp(a, min, max) {
	return Math.min(max, Math.max(min, a));
}

function changeImage(newData) {
	ctx.putImageData(newData, 0, 0);
	workingImgData.data.set(newData.data);
}

let id = 0;

function stringifyStates() {
	pres = "";
	prev = currentState.prev;
	while (prev != null) {
		pres = prev.id + ", " + pres;
		prev = prev.prev;
	}

	next = currentState.next;
	nexs = "";
	while (next != null) {
		nexs = nexs + ", " + next.id;
		next = next.next;
	}
	return pres + " [" + currentState.id + "] " + nexs;
}

function saveState() {
	const saved = ctx.createImageData(workingImgData);
	// for(let i in workingImgData.data){
	// 	saved.data[i] = workingImgData.data[i];
	// }
	saved.data.set(workingImgData.data)

	const state = {
		"data": saved,
		"id": id++
	}
	if (currentState) {
		currentState.next = state;
		state.prev = currentState;
	}
	currentState = state;
	// console.log(stringifyStates());
}

function undoState() {
	if (currentState && currentState.prev) {
		currentState = currentState.prev;
		changeImage(currentState.data);
	}
	// console.log(stringifyStates());
}

function redoState() {
	if (currentState && currentState.next) {
		currentState = currentState.next;
		changeImage(currentState.data)
	}
	// console.log(stringifyStates());
}

undoButton.addEventListener("click", undoState);
redoButton.addEventListener("click", redoState);

function monoMap(x1, y1, map, func) {
	for (let x = 0, xl = map.length; x < xl; x++) {
		row = map[x];
		for (let y = 0, yl = row.length; y < yl; y++) {
			func(x1 + x, y1 + y, row[y]);
		}
	}
}

function fillCircle(x1, y1, w, color, opacity) {
	if (color1[3] >= 255 && opacity >= 1) {
		circle(x1, y1, w, function (x2, y2, r) {
			setPixel(workingImgData, x2, y2, color);
		});
	}

	circle(x1, y1, w, function (x2, y2, r) {
		bGridDo(currentHitPixels, Math.floor(x2), Math.floor(y2), function (x3, y3) {
			editPixel(workingImgData, x3, y3, function (color) {
				return applyStandard(color, color1, opacity);
			});
			return true;
		});
	});
}

function fmod(a, b) {
	return ((a % b) + b) % b;
};

function randomizeBrush(w, h) {
	brushPixels = new Array(w);
	for (let i = 0; i < w; i++) {
		const row = new Array(h);
		brushPixels[i] = row;
		for (let j = 0; j < h; j++) {
			row[j] = Math.random() / (w * 0.7071067);
		}
	}
}

can.addEventListener("mousemove", function (e) {
	octx.clearRect(0, 0, overlay.width, overlay.height);
	prevMcsX = mcsX;
	prevMcsY = mcsY;
	mcsX = e.offsetX;
	mcsY = e.offsetY;
	for (let i = typeChain.length - 1; i >= 0; i--) {
		typeChain[i].mouseMoved(typeChain);
	}
});

can.addEventListener("mousedown", function (e) {
	pressInCanvas = true;
	mouseDownX = mcsX;
	mouseDownY = mcsY;
	mouseDown = true;
	for (let i = typeChain.length - 1; i >= 0; i--) {
		typeChain[i].mouseDown(typeChain);
	}
});

document.addEventListener("mouseup", function (e) {
	octx.clearRect(0, 0, overlay.width, overlay.height);
	mouseDown = false;
	for (let i = typeChain.length - 1; i >= 0; i--) {
		typeChain[i].mouseUp(typeChain);
	}
	pressInCanvas = false;

	if (stateChanged) {
		stateChanged = false;
		saveState();
	}
});

can.addEventListener("dragover", (e) => {
	e.preventDefault();
});

can.addEventListener("dragenter", (e) => {
	overlay.classList.add("dragover");
	e.preventDefault();
});

can.addEventListener("dragleave", (e) => {
	overlay.classList.remove("dragover");
	e.preventDefault();
});

const loadImage = (src) => {
	const img = new Image();
	img.onload = () => {
		ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, can.width, can.height);
		workingImgData = ctx.getImageData(0, 0, can.width, can.height);
		saveState();
	};
	img.src = src;
};

const imgInput = document.getElementById("img-input");

can.addEventListener("drop", (e) => {
	overlay.classList.remove("dragover");
	if (e.dataTransfer.items) {
		const item = e.dataTransfer.items[0];
		if (item.kind === "file") {
			loadImage(URL.createObjectURL(item.getAsFile()));
		}
	}
	e.preventDefault();
});

function start() {
	registerDrawTypes();
	registerShapeTypes();
	registerBlendTypes();
	registerColorTypes();
	registerDensityTypes();
	saveState();
}

start();

if (urlParams.has("srcImg")) {
	const srcUrl = urlParams.get("srcImg");
	loadImage(srcUrl);
}