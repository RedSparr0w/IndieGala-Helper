var settings = {
	theme: "dark",
	theme_color: "red",
	steam_id: "",
	show_steam_activate_window: true,
	hide_high_level_giveaways: true,
	hide_owned_games: true,
	hide_entered_giveaways: true,
	infinite_scroll: true,
	new_giveaway_message: "GLHF!",
	new_giveaway_duration: 1,
	new_giveaway_level: 0,
	blacklist_apps: {},
	blacklist_users: {}
};

function refreshSettings(){
	chrome.storage.sync.get(settings, function(setting) {
		settings = setting;
	});
}

refreshSettings();