// Set Description text for creating a giveaway
$('.giveaway-description').val("GLHF!");
// When "giveaways" -> "in progress" || "completed" is closed then re-opened, get updated data from server
$(".giveaway-in-progress [rel=in_progress]").attr("onclick","justToggleGivInProgressLib=false;");
$(".giveaway-completed [rel=completed]").attr("onclick","justToggleGivCompletedLib=false;");

function handle_check_if_won_response(entry, serial, i){
	if ( serial !== "" ){// YOU WIN!
		entry.parent().parent().html( '<div class="serial-won"><input value="'+serial+'" readonly="" type="text"></div>' );
	}else{// Not a winner
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

// Check all 20 "to check" giveaways have been "checked"
function checked_all(checked){
  if (checked >= 20){
    $('.giveaway-completed').parent().find('.giveaways-completed-list').eq(0).html('<i class="fa fa-refresh fa-5x fa-spin" id="indiegala-helper-pageloading" style="color:#333"></i>');
    $.ajax({
      type: "GET",
      url: '/giveaways/library_completed',
      dataType: "json",
      error: function(){// On error check again after x seconds
        setTimeout(function(){
          checked_all(checked)
        },3000);
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

// Check when completed tab is clicked
$(".giveaway-completed [rel=completed]").on('click',function(){
  // No longer listen to "completed" tab click
  $(".giveaway-completed [rel=completed]").off('click');
  // Add "Check all" && "Reload" buttons to "completed tab"
  $('.giveaway-completed').parent().find('.giveaways-list-cont p').html('<strong>Indiegala Helper Notes:</strong><br/>Once you click the "CHECK ALL" button we will check the first 20 then load the next 20 and so on until all "To check" giveaways have been checked!<br/>When checking all giveaways any "Won" giveaways will move to the "Won" category.').after('<input id="checkAllGiveaways" type="submit" class="btn palette-background-1 right" style="color:white;" value="Check All" /><input id="reloadCompletedGiveaways" type="submit" class="btn palette-background-4 right" style="color:white;" value="Reload">');
  
  // Check all "to check" giveaways when button clicked
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
  
  // Refresh "completed" giveaways tab
  $("#reloadCompletedGiveaways").click(function(e){
    e.preventDefault();
    $('.giveaway-completed').parent().find('.giveaways-completed-list').eq(0).html('<i class="fa fa-refresh fa-5x fa-spin" id="indiegala-helper-pageloading" style="color:#333"></i>');
    $.ajax({
      type: "GET",
      url: '/giveaways/library_completed',
      dataType: "json",
      error: function(){
        $('.giveaway-completed').parent().find('.giveaways-completed-list').eq(0).html('<h2>Retry</h2>');
      },
      success: function(data){
        $('.giveaway-completed').parent().find('.giveaways-list-cont-inner').html(data.html);
      }
    });
  });
});