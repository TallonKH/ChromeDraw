const colorTypeList = [];

const colorPrimary = {
	"name": "Primary",
	"mouseDown": Function.prototype,
	"mouseUp": Function.prototype,
	"mouseMoved": Function.prototype,
	"func": function(x, y, xs, ys) {
		return color1;
	}
}
colorTypeList.push(colorPrimary);

function registerColorTypes() {
	const typeChainIndex = 3;
	typeChain[typeChainIndex] = colorTypeList[0];

	const pane = domec("opListPane");
	const paneTitle = domec("paneHeader");
	paneTitle.innerHTML = "Color";
	pane.appendChild(paneTitle);

	for (const i in colorTypeList) {
		const type = colorTypeList[i];

		const radc = domec("radioOption");
		const rad = document.createElement("input");
		rad.type = "radio";
		rad.name = "colorMode";
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