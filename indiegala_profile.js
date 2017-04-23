// Set Description text for creating a giveaway
$('.giveaway-description').val(localStorage.newGiveawayMessage || "GLHF");
// When "giveaways" -> "in progress" || "completed" is closed then re-opened, get updated data from server
$(".giveaway-in-progress [rel=in_progress]").attr("onclick","justToggleGivInProgressLib=false;");
$(".giveaway-completed [rel=completed]").attr("onclick","justToggleGivCompletedLib=false;");