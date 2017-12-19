// When "giveaways" -> "in progress" || "completed" is closed then re-opened, get updated data from server
$('.giveaways-library-cont .open-library[rel=completed]').attr('onclick','justToggleGivCompletedLibToCheck=false;justToggleGivCompletedLibWon=false;justToggleGivCompletedLib=false;openSingleLibDetAjaxSemaphore.tocheck = true;openSingleLibDetAjaxSemaphore.won = true;');

$('.open-new-giveaway-form').on('click', function(){
	$('.open-new-giveaway-form').off('click');
	$('.giveaway-description').val(settings.new_giveaway_message);
	$('.giveaway-duration option').eq(0).before(`<option value="${settings.new_giveaway_duration}">Default (${settings.new_giveaway_duration} Day${settings.new_giveaway_duration > 1 ? 's' : ''})</option>`).parent().val(settings.new_giveaway_duration);
	$('.giveaway-level-threshold option').eq(0).before(`<option value="${settings.new_giveaway_level}">Default (Level ${settings.new_giveaway_level})</option>`).parent().val(settings.new_giveaway_level);
});