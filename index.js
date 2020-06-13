// When extension icon is clicked open specific page
chrome.browserAction.onClicked.addListener(() => {
	chrome.tabs.create({'url': 'https://www.indiegala.com/profile'});
});

chrome.runtime.onMessage.addListener((data, sender, callback) => {
  if (data.type === 'notification') {
		chrome.notifications.getPermissionLevel((level) => {
			if (level == 'denied') {
				callback(false);
			} else {
				chrome.notifications.create('', data.options);
				callback(true);
			}
		})
		return true;
  }
});
