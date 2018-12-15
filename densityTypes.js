const densityTypeList = [];

const densityRadial = {
	"name": "Radial Gradient",
	"mouseDown": Function.prototype,
	"mouseUp": Function.prototype,
	"mouseMoved": Function.prototype,
	"func": function(x, y, xs, ys) {
		const xl = (xs - x);
		const yl = (ys - y);
		const w = drawWidth;
		const r = Math.sqrt(xl * xl + yl * yl);
		return densityVal * ((1 - r / w) / (r + 1));
	}
}
densityTypeList.push(densityRadial);

const densitySquare = {
	"name": "Square Gradient",
	"mouseDown": Function.prototype,
	"mouseUp": Function.prototype,
	"mouseMoved": Function.prototype,
	"func": function(x, y, xs, ys) {
		const w = drawWidth;
		const r = Math.max(Math.abs(x - xs), Math.abs(y - ys));
		return densityVal * (1 - r / w) / (r + 1);
	}
}
densityTypeList.push(densitySquare);

const densityFlat = {
	"name": "Flat",
	"mouseDown": function(x, y, xs, ys) {
		currentHitPixels = bGridMake(standardChunkSize);
	},
	"mouseUp": Function.prototype,
	"mouseMoved": Function.prototype,
	"func": function(x, y, xs, ys) {
		return bGridIf(currentHitPixels, xs, ys, densityVal, 0);
	}
}
densityTypeList.push(densityFlat);

const densityFuzz = {
	"name": "Fuzz",
	"mouseDown": function(x, y, xs, ys) {
		currentHitPixels = bGridMake(standardChunkSize);
	},
	"mouseUp": Function.prototype,
	"mouseMoved": Function.prototype,
	"func": function(x, y, xs, ys) {
		return bGridIf(currentHitPixels, xs, ys, Math.random() * densityVal, 0);
	}
}
densityTypeList.push(densityFuzz);

const densitySprinklesNoOverlap = {
	"name": "Sprinkles (no overlap)",
	"mouseDown": function(x, y, xs, ys) {
		currentHitPixels = bGridMake(standardChunkSize);
	},
	"mouseUp": Function.prototype,
	"mouseMoved": Function.prototype,
	"func": function(x, y, xs, ys) {
		return bGridIf(currentHitPixels, xs, ys, Math.random() <= densityVal ? 1 : 0, 0);
	}
}
densityTypeList.push(densitySprinklesNoOverlap);

const densitySprinklesOverlap = {
	"name": "Sprinkles (overlap)",
	"mouseDown": Function.prototype,
	"mouseUp": Function.prototype,
	"mouseMoved": Function.prototype,
	"func": function(x, y, xs, ys) {
		return (Math.random() * drawWidth) <= densityVal ? 1 : 0;
	}
}
densityTypeList.push(densitySprinklesOverlap);

const densityBrush = {
	"name": "Brush",
	"mouseDown": function(x, y, xs, ys) {
		randomizeBrush(drawWidth, Math.ceil(drawWidth / 3));
	},
	"mouseUp": Function.prototype,
	"mouseMoved": Function.prototype,
	"func": function(x, y, xs, ys) {
		const row = brushPixels[fmod(xs - x, brushPixels.length)];
		return densityVal * row[fmod(ys - y, row.length)];
	}
}
densityTypeList.push(densityBrush);

function registerDensityTypes() {
	typeChain[4] = densityTypeList[0];

	let queuedHTML4 = "<b>Density Mode: </b><br />";
	for (const i in densityTypeList) {
		const type = densityTypeList[i];
		const is = i.toString();
		queuedHTML4 += "<input type=radio name=densityMode id=densityR" + is + " value=" + is + (i == 0 ? " checked=\"checked\"" : "") + " /> " + type.name + "<br />";
	}
	queuedHTML4 += "<br />";
	optionList.innerHTML += queuedHTML4;
}