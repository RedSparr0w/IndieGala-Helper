// When extension icon is clicked open specific page
chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.create({"url": "https://www.indiegala.com/profile"});
});

/*CHROME*/chrome/*\CHROME*//*FIREFOX*/browser/*\FIREFOX*/.cookies.onChanged.addListener(function (changeInfo){
	if (changeInfo.cookie.name == "steamLogin"){
    if (!changeInfo.removed){
/*CHROME*/
      chrome.cookies.get({url:"https://store.steampowered.com",name:"sessionid"}, function(cookie){
/*\CHROME*/
/*FIREFOX*/
      browser.cookies.get({url:"https://store.steampowered.com",name:"sessionid"})
			.then(cookie => {
/*\FIREFOX*/
        if (!!cookie){
          local_settings.steam_sessionid = cookie.value;
          chrome.storage.local.set({steam_sessionid: cookie.value});
        }
      });
    } else {
      chrome.storage.local.set({steam_sessionid: false});
    }
	}
});
