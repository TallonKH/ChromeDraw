const importMenuItem = {
	"id": "importButton",
	"title": "Edit Image",
	"contexts": ["image"]
}

chrome.contextMenus.create(importMenuItem);
chrome.contextMenus.onClicked.addListener(function(dat, tab) {
	chrome.tabs.create({
		url: chrome.runtime.getURL("popup.html?srcImg=" + dat.srcUrl)
	});
});