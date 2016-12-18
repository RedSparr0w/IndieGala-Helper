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

function checked_all(checked){
  if (checked >= 20){
    $('.giveaway-completed').parent().find('.giveaways-completed-list').eq(0).html('<i class="fa fa-refresh fa-5x fa-spin" id="indiegala-helper-pageloading" style="color:#333"></i>');
    $.ajax({
      type: "GET",
      url: '/giveaways/library_completed',
      dataType: "json",
      error: function(){
        checked_all(checked)
      },
      success: function(data){
        checked=0;
        $('.giveaway-completed').parent().find('.giveaways-list-cont-inner').html(data.html);
        $('.btn-check-if-won').each(function(i){
            var serial = $(this).attr('rel');
            var entry_id = $( 'input[name="entry_id"]', $(this).parent() ).val();
            $.ajax({
              type: "POST",
              url: '/giveaways/check_if_won',
              data: JSON.stringify({ 'entry_id': entry_id }),
              dataType: "json",
              context: $(this),
              success: function(){
                handle_check_if_won_response( $(this), serial, i);
                checked_all(++checked);
              }
            });
        });
      }
    });
  }else{
    return false;
  }
}
$(".giveaway-completed [rel=completed]").on('click',function(){
  $(".giveaway-completed [rel=completed]").off('click');
  $('.giveaway-completed').parent().find('.giveaways-list-cont p').html('<strong>Indiegala Helper Notes:</strong><br/>Once you click the "CHECK ALL" button we will check the first 20 then load the next 20 and so on until all "To check" giveaways have been checked!<br/>When checking all giveaways any "Won" giveaways will move to the "Won" category.').after('<input id="checkAllGiveaways" type="submit" class="btn palette-background-1 right" style="color:white;" value="Check All" /><input id="reloadCompletedGiveaways" type="submit" class="btn palette-background-4 right" style="color:white;" value="Reload">');
  $('#checkAllGiveaways').click(function(e){
    e.preventDefault();
    var checked = 0;
    $('.btn-check-if-won').each(function(i){
        var serial = $(this).attr('rel');
        $(this).html('<i class="fa fa-refresh fa-spin"></i>');
        var entry_id = $( 'input[name="entry_id"]', $(this).parent() ).val();
        $.ajax({
          type: "POST",
          url: '/giveaways/check_if_won',
          data: JSON.stringify({ 'entry_id': entry_id }),
          dataType: "json",
          context: $(this),
          success: function(){
            handle_check_if_won_response( $(this), serial, i);
            checked_all(++checked);
          }
        });
    });
  });
  $("#reloadCompletedGiveaways").click(function(e){
    e.preventDefault();
    checked_all(20);
  });
});