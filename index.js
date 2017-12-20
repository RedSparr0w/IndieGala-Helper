// When extension icon is clicked open specific page
chrome.browserAction.onClicked.addListener(()=>{
	chrome.tabs.create({'url': 'https://www.indiegala.com/profile'});
});
