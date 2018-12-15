const drawTypeList = [];

const drawPen = {
	"name": "Pen",
	"mouseDown": function(typeChain) {
		typeChain[1].func(typeChain, mcsX, mcsY);
		changeImage(workingImgData);
		stateChanged = true;
	},
	"mouseUp": Function.prototype,
	"mouseMoved": function(typeChain) {
		if (pressInCanvas && mouseDown) {
			lineTo(prevMcsX, prevMcsY, mcsX, mcsY, function(x1, y1) {
				typeChain[1].func(typeChain, x1, y1);
			});
			changeImage(workingImgData);
		}
	}
}
drawTypeList.push(drawPen);

const drawLine = {
	"name": "Line",
	"mouseDown": function(typeChain) {
		stateChanged = true;
	},
	"mouseUp": function(typeChain) {
		if(pressInCanvas){
			lineTo(mouseDownX, mouseDownY, mcsX, mcsY, function(x1, y1) {
				typeChain[1].func(typeChain, x1, y1);
			});
			changeImage(workingImgData);
		}
	},
	"mouseMoved": Function.prototype
}
drawTypeList.push(drawLine);

function registerDrawTypes() {
	typeChain[0] = drawTypeList[0];

	let queuedHTML0 = "<b>Draw Mode: </b><br />";
	for (const i in drawTypeList) {
		const type = drawTypeList[i];
		const is = i.toString();
		queuedHTML0 += "<input type=radio name=drawMode id=drawR" + is + " value=" + is + (i == 0 ? " checked=\"checked\"" : "") + " /> " + type.name + "<br />";
	}
	queuedHTML0 += "<br />";
	optionList.innerHTML += queuedHTML0;
}