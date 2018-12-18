const blendTypeList = [];

const blendStandard = {
	"name": "Standard",
	"mouseDown": Function.prototype,
	"mouseUp": Function.prototype,
	"mouseMoved": Function.prototype,
	"func": function(a, b, mix) {
		mix *= clamp(b[3] / 255, 0, 1);
		if (a[3] == 0 || mix == 1) {
			return [b[0], b[1], b[2], b[3] * mix];
		}

		const alpha = (mix + (a[3] / 255) * (1 - mix));
		const rr = (a[0] * (a[3] / 255) * (1 - mix) + b[0] * mix) / alpha;
		const gg = (a[1] * (a[3] / 255) * (1 - mix) + b[1] * mix) / alpha;
		const bb = (a[2] * (a[3] / 255) * (1 - mix) + b[2] * mix) / alpha;
		return cClamp([rr, gg, bb, 255 * alpha]);
	}
}
blendTypeList.push(blendStandard);

const blendAdd = {
	"name": "RGB Add",
	"mouseDown": Function.prototype,
	"mouseUp": Function.prototype,
	"mouseMoved": Function.prototype,
	"func": function(a, b, mix) {
		mix *= clamp(b[3] / 255, 0, 1);
		const alpha = (mix + (a[3] / 255) * (1 - mix));
		return cClamp([a[0] + b[0] * mix, a[1] + b[1] * mix, a[2] + b[2] * mix, 255 * alpha]);
	}
}
blendTypeList.push(blendAdd);

const blendSubtract = {
	"name": "RGB Subtract",
	"mouseDown": Function.prototype,
	"mouseUp": Function.prototype,
	"mouseMoved": Function.prototype,
	"func": function(a, b, mix) {
		mix *= clamp(b[3] / 255, 0, 1);
		const alpha = (mix + (a[3] / 255) * (1 - mix));
		return cClamp([a[0] - b[0] * mix, a[1] - b[1] * mix, a[2] - b[2] * mix, 255 * alpha]);
	}
}
blendTypeList.push(blendSubtract);

const blendAlphaOverride = {
	"name": "Alpha Override",
	"mouseDown": Function.prototype,
	"mouseUp": Function.prototype,
	"mouseMoved": Function.prototype,
	"func": function(a, b, mix) {
		return [a[0], a[1], a[2], lerp(a[3], b[3], mix)];
	}
}
blendTypeList.push(blendAlphaOverride);

function registerBlendTypes() {
	const typeChainIndex = 2;
	typeChain[typeChainIndex] = blendTypeList[0];

	const pane = domec("opListPane");
	const paneTitle = domec("paneHeader");
	paneTitle.innerHTML = "Blend";
	pane.appendChild(paneTitle);

	for (const i in blendTypeList) {
		const type = blendTypeList[i];

		const radc = domec("radioOption");
		const rad = document.createElement("input");
		rad.type = "radio";
		rad.name = "blendMode";
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