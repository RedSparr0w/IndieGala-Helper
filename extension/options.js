// Set Default Settings
let settings = { // eslint-disable-line no-redeclare
	layout: 'dark',
	theme: 'red',
	steam_id: '',
	show_steam_activate_window: true,
	suppress_confirm_show_key_dialog: true,
	auto_enter_giveaways: false,
	hide_high_level_giveaways: true,
	hide_extra_odds: false,
	hide_soundtracks: true,
	hide_owned_games: true,
	hide_entered_giveaways: true,
	hide_above_price: 0,
	hide_above_participants: 0,
	hide_not_guaranteed: false,
	always_show_guaranteed: false,
	infinite_scroll: true,
	new_giveaway_message: 'GLHF!',
	new_giveaway_duration: 1,
	new_giveaway_level: 0,
	current_level: 0
};

let local_settings = { // eslint-disable-line no-redeclare
	blacklist_apps: {},
	blacklist_users: [],
	owned_apps: [],
	owned_apps_next_update: null,
	steam_loginid: false,
	steam_sessionid: false
};

// Get user steam sessionid
try {
	if (/firefox/i.test(navigator.userAgent)){
		browser.cookies.get({url:'https://store.steampowered.com', name:'steamLogin'})
			.then(steamLogin_cookie => {
				if (!!steamLogin_cookie){
					browser.cookies.get({url:'https://store.steampowered.com', name:'sessionid'})
						.then(cookie => {
							if (!!cookie){
								local_settings.steam_sessionid = cookie.value;
								chrome.storage.local.set({steam_sessionid: cookie.value});
							}
						});
				} else {
					chrome.storage.local.set({steam_sessionid: false});
				}
			});
	} else {
		chrome.cookies.get({url:'https://store.steampowered.com', name:'steamLogin'}, (steamLogin_cookie) => {
			if (!!steamLogin_cookie){
				chrome.cookies.get({url:'https://store.steampowered.com', name:'sessionid'}, (cookie) => {
					if (!!cookie){
						local_settings.steam_sessionid = cookie.value;
						chrome.storage.local.set({steam_sessionid: cookie.value});
					}
				});
			} else {
				chrome.storage.local.set({steam_sessionid: false});
			}
		});
	}
}catch(e){
	local_settings.steam_sessionid = false;
	chrome.storage.local.set({steam_sessionid: false});
}

// Firefox fix for something, will figure it out at somepoint..
if (/firefox/i.test(navigator.userAgent)){
	window.oldGetComputedStyle = window.getComputedStyle;
	window.getComputedStyle = (element, pseudoElt) => {
		const t = window.oldGetComputedStyle(element, pseudoElt);
		if (t === null){
			return {
				getPropertyValue:  () => {}
			};
		} else{
			return t;
		}
	};
}

// Init Framework 7 App
const myApp = new Framework7({
	modalTitle: 'IndieGala Helper',
	material: true,
	router: false
});

/* ===== Color / Themes ===== */
$('.layout-theme, .theme-color').click(function(){
	const type = $(this).hasClass('theme-color') ? 'theme' : 'layout';
	const classList = $('body')[0].classList;
	for (let i = 0; i < classList.length; i++){
		if (classList[i].indexOf(`${type}-`) === 0) classList.remove(classList[i]);
	}
	classList.add(`${type}-${$(this).attr(`data-${type}`)}`);
	settings[type] = $(this).attr(`data-${type}`);
	save_options();
});

/* ===== Panel opened/closed ===== */
$('.panel-right').on('open', () => {
	$('.statusbar-overlay').addClass('with-panel-right');
});
$('.panel-right').on('close', () => {
	$('.statusbar-overlay').removeClass('with-panel-left with-panel-right');
});


// Get users owned apps
function getOwnedGames(force_update = false){
	if (settings.steam_id.length != 17){
		myApp.alert('Invalid Steam ID 64 supplied,<br/>Must be 17 characters long..');
		return;
	}
	//check if we have a steamID & check if it has been 24 hours since last update
	if (!!force_update || +local_settings.owned_apps_next_update < +new Date().getTime() ){
		$.ajax({
			dataType:'json',
			url:'https://store.steampowered.com/dynamicstore/userdata/',
			success: (res) => {
				const rgOwnedApps = res.rgOwnedApps || [];
				const rgOwnedPackages = res.rgOwnedPackages || [];
				const ownedApps = [...new Set([...rgOwnedPackages, ...rgOwnedApps])];
				if (ownedApps.length <= 0){
					myApp.alert('No owned games found,<br/>Try signing into steam first.<br/><br/>Attempting fallback server, Less owned games will be retrieved though.');
					getOwnedGamesFallback(force_update);
					return;
				}
				// Set owned apps
				local_settings.owned_apps = ownedApps;
				// Set current time + 24 hours as next updated time
				local_settings.owned_apps_next_update = +new Date().getTime() + (24 * 60 * 60 * 1000);
				save_options('local');
				myApp.alert(`Owned Games List Updated!<br/>Games Found: ${ownedApps.length}`);
			},
			error: (err) => {
				myApp.alert('Are you signed into steam?<br/>Attempting fallback server, Less owned games will be retrieved though.');
				getOwnedGamesFallback(force_update);
			}
		});
	}
}

function getOwnedGamesFallback(force_update = false){
	$.ajax({
		dataType:'json',
		url:`https://indiegala.redsparr0w.com/steamAPI/GetOwnedGames?steamid=${settings.steam_id}`,
		success: (res) => {
			const ownedApps = [];
			const myApps = res.response.games;
			$.each(myApps, (i,v) => {
				ownedApps.push(v.appid);
			});
			// Set owned apps
			local_settings.owned_apps = ownedApps;
			// Set current time + 24 hours as next updated time
			local_settings.owned_apps_next_update = +new Date().getTime() + (24 * 60 * 60 * 1000);
			save_options('local');
			document.getElementsByClassName('modal-button')[0].click();
			myApp.alert(`<i>(Fallback Server)</i><br/>Owned Games List Updated!<br/>Games Found: ${ownedApps.length}`);
		},
		error: (err) => {
			// Don't check for another 30 minutes - Steam may be down
			local_settings.owned_apps_next_update = +new Date().getTime() + (30 * 60 * 1000);
			save_options('local');
			document.getElementsByClassName('modal-button')[0].click();
			myApp.alert(`Something went wrong when updating your owned games list.<br/><hr/><code style="word-wrap: break-word;">${JSON.stringify(err)}</code>`);
			console.error('Owned Games Update Error:', err);
		}
	});
}


function list_blacklisted_apps(){
	$('#app_blacklist').html('');
	$.each(local_settings.blacklist_apps, (app_id, app_name) => {
		$('#app_blacklist').append(`
									<li>
										<div class="item-content">
											<div class="item-inner">
												<div class="item-title">${app_name}</div>
												<div class="item-after"><span class="badge remove solid-bg" data-id="${app_id}"><i class="fa fa-times" aria-hidden="true"></i></span></div>
											</div>
										</div>
									</li>`);
	});
	const DLStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(local_settings.blacklist_apps,null,2))}`;
	$('#backup_blacklist_apps').attr('href', DLStr).attr('download', 'IGH Blacklist_Apps_Backup.json');
}

$('#restore_blacklist_apps').on('change', () => {
	const files = document.getElementById('restore_blacklist_apps').files;
	if (files.length <= 0){
		return false;
	}

	const fr = new FileReader();

	fr.onload = function(e){
		let hiddenApps;
		try{
			hiddenApps = JSON.parse(e.target.result);
		}catch(err){
			console.error(err);
			alert('Something went wrong!\nPlease check you uploaded a valid .json file');
			return;
		}

		if (hiddenApps.constructor === Array){
			alert('You cannot use the old backup file,\nThe structure has changed,\nSorry for this inconvenience.\n- IndieGala Helper');
			return;
		}
		local_settings.blacklist_apps = hiddenApps;
		list_blacklisted_apps();
		save_options('local');
		document.getElementById('restore_blacklist_apps').value = '';
	};

	fr.readAsText(files.item(0));
});

function remove_blacklist_app(el){
	const id = $(el).attr('data-id');
	delete local_settings.blacklist_apps[id];
	save_options('local');
	list_blacklisted_apps();
}

/*****************************************/
/*****************************************/
/*********** SETTINGS STORAGE ************/
/*****************************************/
/*****************************************/

// Saves options to chrome.storage.sync.
let savedTimeout;
function save_options(type = 'sync'){
	switch(type){
		case 'local':
			chrome.storage.local.set(local_settings);
			break;
		case 'sync':
		default:
			$('input, textarea', '#Tab_Options').each((i, el) => {
				const id = $(el).attr('id');
				switch($(el).attr('type')){
					case 'checkbox':
						settings[id] = document.getElementById(id).checked;
						break;
					case 'number':
						settings[id] = Number(document.getElementById(id).value);
						break;
					default:
						settings[id] = document.getElementById(id).value;
				}
			});

			chrome.storage.sync.set(settings, () => {
				$('#save').html('Saved!');
				clearTimeout(savedTimeout);
				savedTimeout = setTimeout( () => { $('#save').html('Save'); }, 2000);
			});
	}
}

// Restores select box and checkbox state using the preferences
function restore_options(){
	restore_sync_options();
	restore_local_options();
}

function restore_sync_options(){
	const themeClassList = $('body')[0].classList;
	// Use default value (settings obj) if option not set
	chrome.storage.sync.get(settings, (setting) => {
		for (let i = themeClassList.length-1; i >= 0 ; i--){
			if (themeClassList[i].indexOf('layout-') === 0 || themeClassList[i].indexOf('theme-') === 0) themeClassList.remove(themeClassList[i]);
		}
		settings = setting;
		themeClassList.add(`layout-${settings.layout}`);
		themeClassList.add(`theme-${settings.theme}`);
		$('input, textarea', '#Tab_Options').each((i, el) => {
			const id = $(el).attr('id');
			switch($(el).attr('type')){
				case 'checkbox':
					document.getElementById(id).checked = settings[id];
					break;
				default:
					document.getElementById(id).value = settings[id];
			}
		});

		/** Events for after options are restored **/
		// Save options when save button clicked
		document.getElementById('save').addEventListener('click', () => { save_options('sync'); });
		// Listen to changes in inputs/textarea and update settings
		$('input, textarea', '#Tab_Options').on('change', () => { save_options('sync'); });
	});
}

function restore_local_options(){
	chrome.storage.local.get(local_settings, (setting) => {
		local_settings = setting;
		// Check Owned Apps
		getOwnedGames();
		document.getElementById('refresh_owned').addEventListener('click', () => { getOwnedGames(true); });

		// Blacklist stuff
		list_blacklisted_apps();
		$(document).on('click', '.remove', function(){ remove_blacklist_app(this); }); // Must be function() for `this`
	});
}

// Restore current settings on page load
document.addEventListener('DOMContentLoaded', restore_options);
