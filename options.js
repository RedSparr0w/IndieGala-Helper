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
  new_giveaway_level: 0
};

// Init App
var myApp = new Framework7({
    modalTitle: 'IndieGala Helper',
    material: true,
    router: false
});

// Expose Internal DOM library
var $$ = Dom7;

/* ===== Color themes ===== */
$$('.color-theme').click(function () {
    var classList = $$('body')[0].classList;
    for (var i = 0; i < classList.length; i++) {
        if (classList[i].indexOf('theme') === 0) classList.remove(classList[i]);
    }
    classList.add('theme-' + $$(this).attr('data-theme'));
    updateSetting('theme_color',$$(this).attr('data-theme'));
});
$$('.layout-theme').click(function () {
    var classList = $$('body')[0].classList;
    for (var i = 0; i < classList.length; i++) {
        if (classList[i].indexOf('layout-') === 0) classList.remove(classList[i]);
    }
    classList.add('layout-' + $$(this).attr('data-theme'));
    updateSetting('theme',$$(this).attr('data-theme'));
});

/* ===== Change statusbar bg when panel opened/closed ===== */
$$('.panel-right').on('open', function () {
    $$('.statusbar-overlay').addClass('with-panel-right');
});
$$('.panel-right').on('close', function () {
    $$('.statusbar-overlay').removeClass('with-panel-left with-panel-right');
});

function updateSetting(obj,val){
  settings[obj] = val;
  save_options();
}

// Saves options to chrome.storage.sync.
function save_options() {
	
  settings.steam_id = document.getElementById('steam_id').value;
  settings.show_steam_activate_window = document.getElementById('show_steam_activate_window').checked;
  settings.hide_high_level_giveaways = document.getElementById('hide_high_level_giveaways').checked;
  settings.hide_owned_games = document.getElementById('hide_owned_games').checked;
  settings.hide_entered_giveaways = document.getElementById('hide_entered_giveaways').checked;
  settings.infinite_scroll = document.getElementById('infinite_scroll').checked;
  settings.new_giveaway_message = document.getElementById('new_giveaway_message').value;
  settings.new_giveaway_duration = document.getElementById('new_giveaway_duration').value;
  settings.new_giveaway_level = document.getElementById('new_giveaway_level').value;
	
  chrome.storage.sync.set(settings, function() {
    console.log('Saved!');
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
   var themeClassList = $$('body')[0].classList;
  // Use default value (settings)
  chrome.storage.sync.get(settings, function(setting) {
    for (var i = themeClassList.length-1; i >= 0 ; i--){
      if (themeClassList[i].indexOf('layout-') === 0) themeClassList.remove(themeClassList[i]);
      if (themeClassList[i].indexOf('theme') === 0) themeClassList.remove(themeClassList[i]);
    }
    settings.theme = setting.theme;
    settings.theme_color = setting.theme_color;
    themeClassList.add('layout-' + setting.theme);
    themeClassList.add('theme-' + setting.theme_color);
    document.getElementById('steam_id').value = setting.steam_id;
    document.getElementById('show_steam_activate_window').checked = setting.show_steam_activate_window;
    document.getElementById('hide_high_level_giveaways').checked = setting.hide_high_level_giveaways;
    document.getElementById('hide_owned_games').checked = setting.hide_owned_games;
    document.getElementById('hide_entered_giveaways').checked = setting.hide_entered_giveaways;
    document.getElementById('infinite_scroll').checked = setting.infinite_scroll;
    document.getElementById('new_giveaway_message').value = setting.new_giveaway_message;
    document.getElementById('new_giveaway_duration').value = setting.new_giveaway_duration;
    document.getElementById('new_giveaway_level').value = setting.new_giveaway_level;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
var inputs = document.getElementsByTagName('input')
for (i = 0; i < inputs.length; i++){
  inputs[i].addEventListener('change', save_options);
}
document.getElementsByTagName('textarea')[0].addEventListener('change', save_options);