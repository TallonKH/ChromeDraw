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
			if (shiftDown) {
				const dx = mouseDownX - mcsX;
				const dy = mouseDownY - mcsY;
				const l = Math.sqrt(dx * dx + dy * dy);
				const rads = Math.round(Math.atan(dy / dx) / 0.2617993878) * 0.2617993878 + (dx >= 0 ? 3.14159 : 0);
				const ex = mouseDownX + l * Math.cos(rads);
				const ey = mouseDownY + l * Math.sin(rads);
				lineTo(mouseDownX, mouseDownY, ex, ey, function(x1, y1) {
					typeChain[1].func(typeChain, x1, y1);
				});
			} else {
				lineTo(mouseDownX, mouseDownY, mcsX, mcsY, function(x1, y1) {
					typeChain[1].func(typeChain, x1, y1);
				});
			}
			changeImage(workingImgData);
		}
	},
	"mouseMoved": function(typeChain) {
		if (pressInCanvas) {
			if (shiftDown) {
				const dx = mouseDownX - mcsX;
				const dy = mouseDownY - mcsY;
				const l = Math.sqrt(dx * dx + dy * dy);
				if (l > 0) {
					const rads = Math.round(Math.atan(dy / dx) / 0.2617993878) * 0.2617993878 + (dx >= 0 ? 3.14159 : 0);
					const ex = mouseDownX + l * Math.cos(rads);
					const ey = mouseDownY + l * Math.sin(rads);
					octx.strokeStyle = "#000000";
					octx.lineWidth = 2;
					octx.beginPath();
					octx.moveTo(mouseDownX, mouseDownY);
					octx.lineTo(ex, ey);
					octx.closePath();
					octx.stroke();

					const degs = fmod(-Math.round(rads * 57.29578), 360).toString() + "\u{00B0}";
					octx.font = " 20px Arial";
					octx.strokeStyle = "#000000";
					octx.lineWidth = 6;
					octx.strokeText(degs, mouseDownX, mouseDownY - 10);
					octx.fillStyle = "#ffffff";
					octx.fillText(degs, mouseDownX, mouseDownY - 10);
				}
			} else {
				octx.strokeStyle = "#000000";
				octx.lineWidth = 2;
				octx.beginPath();
				octx.moveTo(mouseDownX, mouseDownY);
				octx.lineTo(mcsX, mcsY);
				octx.closePath();
				octx.stroke();
			}
		}
	}
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
		rad.addEventListener("change", function() {
			typeChain[typeChainIndex] = type;
		});
		radc.appendChild(rad);
		radc.appendChild(domte(type.name));

		pane.appendChild(radc);
	}
	optionList.appendChild(pane);
}