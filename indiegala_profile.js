$('.giveaway-completed').parent().find('.giveaways-list-cont').prepend('<input id="checkAllGiveaways" type="submit" class="btn palette-background-1 right" style="color:white;" value="Check All Giveaways" />');

function handle_check_if_won_response($this, response, i){
	if ( response['is_winner'] == 'true' ){
		$this.parent().parent().html( '<div class="serial-won"><input value="'+response['serial']+'" readonly="" type="text"></div>' );
	}else if ( response['is_winner'] == 'false' ){
		// not winner
		$this.attr('disabled', true);
		$this.html("You did't win :(");
		setTimeout( function(){ 
			$this.parents('li').fadeOut(400, function(){ $(this).remove(); });
		}, 2000+(i*50));
	}else{
		// error
		$( '.fa', $this ).remove();
		$this.html('<i class="fa fa-refresh" aria-hidden="true"></i> Error. Retry');
	}
}

$('#checkAllGiveaways').click(function(e){
	e.preventDefault();
	$('.btn-check-if-won').each(function(i){
			var $this = $(this);
			var entry_id = $( 'input[name="entry_id"]', $this.parent() ).val();

			var response = {}
			response['is_winner'] = 'false'

			console.log( "### Check if won ajax ### $this.attr('rel'): "+ $this.attr('rel') );
			if ( $this.attr('rel') != '' ){
				response['is_winner'] 		= 'true';
				response['serial'] 			= $this.attr('rel');
			}

			handle_check_if_won_response( $this, response, i);

			$.ajax({
				type: "POST",
				url: '/giveaways/check_if_won',
				data: JSON.stringify({ 'entry_id': entry_id }),
				dataType: "json",
				context: $this,
				beforeSend: function(){
					checkIfWonAjaxSemaphore = false;
				},
				success: function(data){}, 
				error: function(){},
				complete: function(){
					checkIfWonAjaxSemaphore = true;
				},
			});
	});
	$(this).fadeOut(300);
});