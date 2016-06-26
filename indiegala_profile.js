$('.giveaway-completed').parent().find('.giveaways-list-cont').prepend('<input id="checkAllGiveaways" type="submit" class="btn palette-background-1 right" style="color:white;" value="Check All Giveaways" />');
$('.giveaway-description').val("GLHF!");
$(".giveaway-in-progress [rel=in_progress]").attr("onclick","justToggleGivInProgressLib=false;");
$(".giveaway-completed [rel=completed]").attr("onclick","justToggleGivCompletedLib=false;");

function handle_check_if_won_response(entry, serial, i){
	if ( serial !== "" ){
		entry.parent().parent().html( '<div class="serial-won"><input value="'+serial+'" readonly="" type="text"></div>' );
	}else{// not winner
		if (localStorage.getItem("removeAnimationCheckAll") === "true" || localStorage.getItem("removeAnimationCheckAll") === true){
			entry.parents('li').remove();
		}else{
			entry.html("You did't win :(");
			setTimeout( function(){ 
				entry.parents('li').fadeOut(400, function(){ $(this).remove(); });
			}, 2000+(i*50));
		}
	}
}


$('#checkAllGiveaways').click(function(e){
	e.preventDefault();
	$('.btn-check-if-won').each(function(i){
			var serial = $(this).attr('rel');
			handle_check_if_won_response( $(this), serial, i);
			var entry_id = $( 'input[name="entry_id"]', $(this).parent() ).val();
			$.ajax({
				type: "POST",
				url: '/giveaways/check_if_won',
				data: JSON.stringify({ 'entry_id': entry_id }),
				dataType: "json",
				context: $(this)
			});
	});
});