// Get extension current version
const version = chrome.runtime.getManifest().version;

// When extension icon is clicked open specific page
chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.create({"url": "https://www.indiegala.com/profile"});
});

if (Number(localStorage.getItem("version").split(".")[0]) <= 3){
	localStorage.setItem("version",version);
	
	chrome.storage.sync.get({blacklist_apps: {}}, function(blacklist) {
		chrome.storage.local.set(blacklist);
	});
}

