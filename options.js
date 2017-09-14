// Set Default Settings
var settings = {
  theme: "dark",
  theme_color: "red",
  steam_id: "",
  show_steam_activate_window: true,
	suppress_confirm_show_key_dialog: true,
  auto_enter_giveaways: false,
  hide_high_level_giveaways: true,
	hide_soundtracks: true,
  hide_owned_games: true,
  hide_entered_giveaways: true,
  hide_above_price: 0,
  hide_above_participants: 0,
  infinite_scroll: true,
  new_giveaway_message: "GLHF!",
  new_giveaway_duration: 1,
  new_giveaway_level: 0,
  blacklist_apps: {},
  blacklist_users: [],
	current_level: 0
};

var local_settings = {
	owned_apps: [],
	owned_apps_last_update: null
}

if (/firefox/i.test(navigator.userAgent)){
   window.oldGetComputedStyle = window.getComputedStyle;
   window.getComputedStyle = function (element, pseudoElt) {
      var t = window.oldGetComputedStyle(element, pseudoElt);
      if (t === null) {
         return {
            getPropertyValue: function(){}
         };
      } else{
         return t;
      }
   };
}

// Init Framework 7 App
var myApp = new Framework7({
    modalTitle: 'IndieGala Helper',
    material: true,
    router: false
});

//Framework7 DOM library
const $$ = Dom7;

/* ===== Color / Themes ===== */
$$('.color-theme').click(function () {
    let classList = $$('body')[0].classList;
    for (let i = 0; i < classList.length; i++) {
        if (classList[i].indexOf('theme') === 0) classList.remove(classList[i]);
    }
    classList.add('theme-' + $$(this).attr('data-theme'));
    settings['theme_color'] = $$(this).attr('data-theme');
		save_options();
});
$$('.layout-theme').click(function () {
    let classList = $$('body')[0].classList;
    for (let i = 0; i < classList.length; i++) {
        if (classList[i].indexOf('layout-') === 0) classList.remove(classList[i]);
    }
    classList.add('layout-' + $$(this).attr('data-theme'));
    settings['theme'] = $$(this).attr('data-theme');
		save_options();
});

/* ===== Panel opened/closed ===== */
$$('.panel-right').on('open', function () {
    $$('.statusbar-overlay').addClass('with-panel-right');
});
$$('.panel-right').on('close', function () {
    $$('.statusbar-overlay').removeClass('with-panel-left with-panel-right');
});


// Get users owned apps
function getOwnedGames(force_update = false){
	if (!!force_update || settings.steam_id.length == 17 && (!local_settings.owned_apps_last_update || Number(local_settings.owned_apps_last_update) < (new Date().getTime() - (24 * 60 * 60 * 1000))) ){//check if we have a steamID & see how long ago we checked (24 hours)
		$.ajax({
			dataType:"json",
			url:"https://api.enhancedsteam.com/steamapi/GetOwnedGames/?steamid=" + settings.steam_id + "&include_appinfo=0&include_played_free_games=1",
			success: function(res){
				var ownedApps=[];
				var myApps = res.response.games;
				$.each(myApps,function(i,v){
					ownedApps.push(v.appid);
				});
				// Set owned apps
				local_settings.owned_apps = ownedApps;
				// Set current time as last updated time
				local_settings.owned_apps_last_update = new Date().getTime();
				save_options('local');
				myApp.alert('Owned Games List Updated!<br/>Games Found: ' + ownedApps.length);
			},
			error: function(e){
				// Don't check for atleast another 30 minutes - Steam may be down
				local_settings.owned_apps_last_update = Number(local_settings.owned_apps_last_update) + (30 * 60 * 1000);
				save_options('local');
				myApp.alert('Something went wrong when updating your owned games list, Your IP may be blocked by Cloudflare, You could try using a VPN to get around this.');
				try{
					console.error('Owned Games Update Error: ' + e);
				}catch(err){
					console.error(err);
				}
			}
		});
	}
}


function list_blacklisted_apps(){
	$('#app_blacklist').html("");
	$.each(settings.blacklist_apps, function(app_id, app_name){
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
	let DLStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings.blacklist_apps,null,2));
	$('#backup_blacklist_apps').attr("href", DLStr).attr("download", "IGH Blacklist_Apps_Backup.json");
}

$('#restore_blacklist_apps').on("change",function() {
  var files = document.getElementById('restore_blacklist_apps').files;
  if (files.length <= 0) {
    return false;
  }

  var fr = new FileReader();

  fr.onload = function(e) { 
    try{
      hiddenApps = JSON.parse(e.target.result);
    }catch(e){
      console.error(e);
      alert("Something went wrong!\nPlease check you uploaded a valid .json file");
      return;
    }
		console.log(hiddenApps);
		if (hiddenApps.constructor === Array){
      alert("You cannot use the old backup file,\nThe structure has changed,\nSorry for this inconvenience.\n- IndieGala Helper");
      return;
		}
    settings.blacklist_apps = hiddenApps;
    list_blacklisted_apps();
		save_options('sync');
    document.getElementById('restore_blacklist_apps').value = "";
  }

  fr.readAsText(files.item(0));
});

function remove_blacklist_app(el){
	let id = $(el).attr('data-id');
	delete settings.blacklist_apps[id];
	save_options('sync');
  list_blacklisted_apps();
}

/*****************************************/
/*****************************************/
/*********** SETTINGS STORAGE ************/
/*****************************************/
/*****************************************/

// Saves options to chrome.storage.sync.
var savedTimeout;
function save_options(type = 'sync') {
  switch(type){
		case 'sync':
			settings.steam_id = document.getElementById('steam_id').value;
			settings.show_steam_activate_window = document.getElementById('show_steam_activate_window').checked;
			settings.suppress_confirm_show_key_dialog = document.getElementById('suppress_confirm_show_key_dialog').checked;
			settings.auto_enter_giveaways = document.getElementById('auto_enter_giveaways').checked;
			settings.hide_high_level_giveaways = document.getElementById('hide_high_level_giveaways').checked;
			settings.hide_soundtracks = document.getElementById('hide_soundtracks').checked;
			settings.hide_owned_games = document.getElementById('hide_owned_games').checked;
			settings.hide_entered_giveaways = document.getElementById('hide_entered_giveaways').checked;
			settings.hide_above_price = Number(document.getElementById('hide_above_price').value);
			settings.hide_above_participants = Number(document.getElementById('hide_above_participants').value);
			settings.infinite_scroll = document.getElementById('infinite_scroll').checked;
			settings.new_giveaway_message = document.getElementById('new_giveaway_message').value;
			settings.new_giveaway_duration = Number(document.getElementById('new_giveaway_duration').value);
			settings.new_giveaway_level = Number(document.getElementById('new_giveaway_level').value);
			
			chrome.storage.sync.set(settings, function() {
				$("#save").html("Saved!");
				try {
					clearTimeout(savedTimeout);
				}finally{
					savedTimeout = setTimeout(function(){
						$("#save").html("Save");
					}, 2000);
				}
			});
			break;
		case 'local':
			chrome.storage.local.set(local_settings);
			break;
	}
}

// Restores select box and checkbox state using the preferences
function restore_options() {
   let themeClassList = $$('body')[0].classList;
  // Use default value (settings obj) if option not set
  chrome.storage.sync.get(settings, function(setting){
    for (let i = themeClassList.length-1; i >= 0 ; i--){
      if (themeClassList[i].indexOf('layout-') === 0) themeClassList.remove(themeClassList[i]);
      if (themeClassList[i].indexOf('theme') === 0) themeClassList.remove(themeClassList[i]);
    }
    settings = setting;
    themeClassList.add('layout-' + setting.theme);
    themeClassList.add('theme-' + setting.theme_color);
    document.getElementById('steam_id').value = setting.steam_id;
    document.getElementById('show_steam_activate_window').checked = setting.show_steam_activate_window;
    document.getElementById('suppress_confirm_show_key_dialog').checked = setting.suppress_confirm_show_key_dialog;
    document.getElementById('auto_enter_giveaways').checked = setting.auto_enter_giveaways;
    document.getElementById('hide_high_level_giveaways').checked = setting.hide_high_level_giveaways;
    document.getElementById('hide_soundtracks').checked = setting.hide_soundtracks;
    document.getElementById('hide_owned_games').checked = setting.hide_owned_games;
    document.getElementById('hide_entered_giveaways').checked = setting.hide_entered_giveaways;
    document.getElementById('hide_above_price').value = setting.hide_above_price;
    document.getElementById('hide_above_participants').value = setting.hide_above_participants;
    document.getElementById('infinite_scroll').checked = setting.infinite_scroll;
    document.getElementById('new_giveaway_message').value = setting.new_giveaway_message;
    document.getElementById('new_giveaway_duration').value = setting.new_giveaway_duration;
    document.getElementById('new_giveaway_level').value = setting.new_giveaway_level;
		
		/** Events for after options are restored **/
		// Save options when save button clicked
		document.getElementById('save').addEventListener('click', function(){
			save_options('sync');
		});
		// Listen to changes in inputs/textarea and update settings
		document.getElementsByTagName('textarea')[0].addEventListener('change', function(){
			save_options('sync');
		});
		var inputs = document.getElementsByTagName('input')
		for (i = 0; i < inputs.length; i++){
			inputs[i].addEventListener('change', function(){
				save_options('sync');
			});
		}
		// Blacklist stuff
		list_blacklisted_apps();
		$(document).on("click",".remove",function(){
			remove_blacklist_app(this);
		});
  });
  chrome.storage.local.get(local_settings, function(setting){
		// Check Owned Apps
		local_settings = setting;
		getOwnedGames();
		document.getElementById('refresh_owned').addEventListener('click', function(){
			getOwnedGames(true);
		});
  });
}

// Restore current settings on page load
document.addEventListener('DOMContentLoaded', restore_options);
