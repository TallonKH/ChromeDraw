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
		if (pressInCanvas) {
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
	const typeChainIndex = 0;
	typeChain[typeChainIndex] = drawTypeList[0];

	const pane = domec("opListPane");
	const paneTitle = domec("paneHeader");
	paneTitle.innerHTML = "Draw Mode";
	pane.appendChild(paneTitle);

	for (const i in drawTypeList) {
		const type = drawTypeList[i];

		const radc = domec("radioOption");
		const rad = document.createElement("input");
		rad.type = "radio";
		rad.name = "drawMode";
		if (i == 0) {
			rad.checked = "checked";
		}
		rad.onchange = function() {
			typeChain[typeChainIndex] = type;
		}
		radc.appendChild(rad);
		radc.appendChild(domte(type.name));

		pane.appendChild(radc);
	}
	optionList.appendChild(pane);
}