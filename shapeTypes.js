const shapeTypeList = [];

const shapeCircle = {
	"name": "Circle",
	"mouseDown": Function.prototype,
	"mouseUp": Function.prototype,
	"mouseMoved": Function.prototype,
	"func": function(typeChain, x, y) {
		const shapeFunc = function(xs, ys) {
			editPixel(workingImgData, xs, ys, function(color) {
				return typeChain[2].func(color, typeChain[3].func(x, y, xs, ys), typeChain[4].func(x, y, xs, ys));
			});
		};

		const r = drawWidth;
		const r2 = r * r;
		for (let yy = -Math.max(y - Math.max(0, y - r), Math.min(imgHeight, y + r) - y); yy < 0; yy++) {
			const xw = Math.floor(Math.sqrt(r2 - (yy * yy)));
			for (let xx = Math.max(0, x - xw); xx < Math.min(imgWidth, x + xw); xx++) {
				shapeFunc(xx, y + yy);
				shapeFunc(xx, y - yy);
			}
		}
		for (let xx = Math.max(0, x - r); xx < Math.min(imgWidth, x + r); xx++) {
			shapeFunc(xx, y);
		}
	}
}
shapeTypeList.push(shapeCircle);

const shapeSquare = {
	"name": "Square",
	"mouseDown": Function.prototype,
	"mouseUp": Function.prototype,
	"mouseMoved": Function.prototype,
	"func": function(typeChain, x, y) {
		const shapeFunc = function(xs, ys) {
			editPixel(workingImgData, xs, ys, function(color) {
				return typeChain[2].func(color, typeChain[3].func(x, y, xs, ys), typeChain[4].func(x, y, xs, ys));
			});
		};
		const r = drawWidth;

		const minX = Math.max(x - r, 0);
		const maxX = Math.min(x + r, imgWidth);
		const minY = Math.max(y - r, 0);
		const maxY = Math.min(y + r, imgHeight);
		for (let xx = minX; xx < maxX; xx++) {
			for (let yy = minY; yy < maxY; yy++) {
				shapeFunc(xx, yy);
			}
		}
	}
}
shapeTypeList.push(shapeSquare);

const shapeRect = {
	"name": "Rectangle",
	"mouseDown": Function.prototype,
	"mouseUp": Function.prototype,
	"mouseMoved": Function.prototype,
	"func": function(typeChain, x, y) {
		const shapeFunc = function(xs, ys) {
			editPixel(workingImgData, xs, ys, function(color) {
				return typeChain[2].func(color, typeChain[3].func(x, y, xs, ys), typeChain[4].func(x, y, xs, ys));
			});
		};
		const r = drawWidth;
		const r2 = Math.ceil(drawWidth/6);

		const minX = Math.max(x - r, 0);
		const maxX = Math.min(x + r, imgWidth);
		const minY = Math.max(y - r2, 0);
		const maxY = Math.min(y + r2, imgHeight);
		for (let xx = minX; xx < maxX; xx++) {
			for (let yy = minY; yy < maxY; yy++) {
				shapeFunc(xx, yy);
			}
		}
	}
}
shapeTypeList.push(shapeRect);

function registerShapeTypes() {
	typeChain[1] = shapeTypeList[0];

	let queuedHTML1 = "<b>Shape Mode: </b><br />";
	for (const i in shapeTypeList) {
		const type = shapeTypeList[i];
		const is = i.toString();
		queuedHTML1 += "<input type=radio name=shapeMode id=shapeR" + is + " value=" + is + (i == 0 ? " checked=\"checked\"" : "") + " /> " + type.name + "<br />";
	}
	queuedHTML1 += "<br />";
	optionList.innerHTML += queuedHTML1;
}