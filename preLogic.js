const optionList = document.getElementById("optionList");
const typeChain = [null, null, null, null, null];

// new div with class
function domec(clas){
	const e = document.createElement("div");
	e.className = clas;
	return e;
}

// new div with class
function domte(text){
	return document.createTextNode(text);
}