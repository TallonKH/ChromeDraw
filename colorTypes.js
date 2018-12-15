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
	typeChain[3] = colorTypeList[0];

	let queuedHTML3 = "<b>Color Mode: </b><br />";
	for (const i in colorTypeList) {
		const type = colorTypeList[i];
		const is = i.toString();
		queuedHTML3 += "<input type=radio name=colorMode id=colorR" + is + " value=" + is + (i == 0 ? " checked=\"checked\"" : "") + " /> " + type.name + "<br />";
	}
	queuedHTML3 += "<br />";
	optionList.innerHTML += queuedHTML3;
}