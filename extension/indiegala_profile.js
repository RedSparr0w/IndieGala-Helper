/* TODO: FIX
// When "giveaways" -> "in progress" || "completed" is closed then re-opened, get updated data from server
$('.giveaways-library-cont .open-library[rel=completed]').attr('onclick','justToggleGivCompletedLibToCheck=false;justToggleGivCompletedLibWon=false;justToggleGivCompletedLib=false;openSingleLibDetAjaxSemaphore.tocheck = true;openSingleLibDetAjaxSemaphore.won = true;');

$('.open-new-giveaway-form').on('click', () => {
	$('.open-new-giveaway-form').off('click');
	$('.giveaway-description').val(settings.new_giveaway_message);
	$('.giveaway-duration option').eq(0).before(`<option value="${settings.new_giveaway_duration}">Default (${settings.new_giveaway_duration} Day${settings.new_giveaway_duration > 1 ? 's' : ''})</option>`).parent().val(settings.new_giveaway_duration);
	$('.giveaway-level-threshold option').eq(0).before(`<option value="${settings.new_giveaway_level}">Default (Level ${settings.new_giveaway_level})</option>`).parent().val(settings.new_giveaway_level);
});
*/
setInterval(() => {
	$('.profile-private-page-library-key-icon.bg-gradient-grey .fa-steam').each(function(){
		const outer_el = $(this).parent('.relative')[0];
		$('.bg-gradient-grey', outer_el).addClass('bg-gradient-blue').removeClass('bg-gradient-grey');
	});
}, 500);

// When steam icon clicked
$(document).on('click','.profile-private-page-library-key-icon.bg-gradient-blue',function(){
	try{
    // Get parent element
    const outer_el = $(this).parent('.relative')[0];
    // Get the key
    const key = $('.profile-private-page-library-key-serial', outer_el).val();
    // Check the key follows steam format
    if (!/^[\d\w]{2,5}(-[\d\w]{4,5}){2,4}$/.test(key)){
      return notifyMe('Couldn\'t find a valid steam key, try activating it manually..');
    }
    // Prepare our data
    const data = {
      type: 'activate-steam-key',
      product_key: key,
      sessionid: local_settings.steam_sessionid,
    };

    // Check that the user is logged in
    if (local_settings.steam_sessionid) {
      if (!confirm(`Are you sure you wan't to activate this key on steam?\nMust be logged into the steam website for this feature to work.`)) return;
      chrome.runtime.sendMessage(data, (result)=>{
        if (!result) return window.open(`https://store.steampowered.com/account/registerkey?key=${data.product_key}`);
        else notifyMe(result);
      })
    } else {
      // User not logged in, open the page instead
      window.open(`https://store.steampowered.com/account/registerkey?key=${data.product_key}`);
    }
	}catch(e){
		return;
	}
});

// When game key clicked, select the whole key and copy to clipboard
$(document).on('click','input.profile-private-page-library-key-serial',function(){
	try{
		// Select text, copy to clipboard
		$(this).select();
		document.execCommand('copy');
		// Check if "show steam activate window" is ticked
		if( settings.show_steam_activate_window ){
			window.location.href = 'steam://open/activateproduct';
		}
	}catch(e){
		return;
	}
});
