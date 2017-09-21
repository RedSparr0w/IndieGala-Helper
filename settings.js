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
  hide_not_guaranteed: false,
  always_show_guaranteed: false,
  infinite_scroll: true,
  new_giveaway_message: "GLHF!",
  new_giveaway_duration: 1,
  new_giveaway_level: 0,
	current_level: 0
};

var local_settings = {
  blacklist_apps: {},
  blacklist_users: [],
	owned_apps: [],
	owned_apps_last_update: null
}

function refreshSettings(type = 'sync'){
	switch(type){
		case 'sync':
			chrome.storage.sync.get(settings, function(setting) {
				settings = setting;
			});
			break;
		case 'local':
			chrome.storage.local.get(local_settings, function(setting) {
				local_settings = setting;
			});
			break;
		case 'all':
			chrome.storage.sync.get(settings, function(setting) {
				settings = setting;
			});
			chrome.storage.local.get(local_settings, function(setting) {
				local_settings = setting;
			});
			break;
	}
}

refreshSettings('all');

chrome.storage.onChanged.addListener(function(changes, namespace) {
	refreshSettings(namespace);
});
