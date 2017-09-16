// Get extension current version
const version = chrome.runtime.getManifest().version;

// When extension icon is clicked open specific page
chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.create({"url": "https://www.indiegala.com/profile"});
});

function checkVersion(check_version, above = false){
	let old_version = !!localStorage.getItem("version") ? localStorage.getItem("version").split(".").map(Number) : "0.0.0";
	check_version = check_version.split(".").map(Number)
	while (old_version.length < check_version.length) old_version.push(0);
	while (check_version.length < old_version.length) check_version.push(0);
	for (var i = 0; i < check_version.length; ++i) {
    if (old_version[i] == check_version[i])
			continue;
    return above ? old_version[i] > check_version[i] : old_version[i] < check_version[i];
  }
	return false;
}

if (checkVersion("4.0.0", false)){
	localStorage.setItem("version",version);

	chrome.storage.sync.get({blacklist_apps: {}}, function(blacklist) {
		chrome.storage.local.set(blacklist, function(blacklist) {
			chrome.storage.sync.remove('blacklist_apps');
		});
	});
}
