// Add page navigation to bottom of page aswell
$('.page-nav').parent().clone().insertAfter('.search-cont');
function showOwnedGames(){
	// Get App ID's && Names
	$('.trade-cont img[src*=apps]').not('.checked').addClass('checked').each(function(i){
		let str = $(this).attr("src");
		let start,end;
		start = (str.indexOf("apps/") > 0 ? str.indexOf("apps/") : str.indexOf("dium/"));
		end = (str.indexOf("/header.jpg") > 0 ? str.indexOf("/header.jpg") : str.indexOf(".jpg"));
		let app_id = Number(str.substring(start+5,end));
		// Check if app_id is valid
		if (isNaN(app_id)){ app_id = 0; }
		// Remove If Blacklisted
		if (typeof local_settings.blacklist_apps[app_id] != "undefined"){
			$(this).parents(".trade-cont").remove();
			return;
		}
		// Remove/Display If Owned
		if ( !!($.inArray(app_id, local_settings.owned_apps) + 1) ){
			if (!!settings.hide_owned_games){
				$(this).parents(".trade-cont").remove();
				return;
			}else{
				$(this).parents(".trade-cont").addClass("owned").find(".main").html("(owned)");
			}
		}
		$(this).parents(".trade-cont").find(".read-more").html('<i class="fa fa-steam" aria-hidden="true"></i> <a class="viewOnSteam" href="http://store.steampowered.com/app/' + app_id + '" target="_BLANK">View on Steam &rarr;</a>');
	}).on('error', function(){
		$(this).attr('src','http://i.imgur.com/eMShBmW.png');
	});

	// Add button to hide specific apps
	$('.trade_img').not('.checked').addClass('checked').prepend('<span class="mark-as-owned">Hide This Game <i class="fa fa-times"></i></span>');

	// Show remaining apps
	$('.trade-cont').fadeIn();
}

showOwnedGames();

// When page number clicked load that page via ajax
$(document).on('click','.page-link-cont',function(e){
	e.preventDefault();
	// Scroll to top of section
	$('html, body').animate({
		scrollTop: $(".search-type-cont").offset().top-80
	}, 1000);
	// Hide old giveaways - show loading symbol
	$('.trades-main-page .row.no-padding').slideUp(1000,function(){
		$('.trades-main-page .row.no-padding').html('<i class="fa fa-refresh fa-5x fa-spin" id="indiegala-helper-pageloading"></i>');
		$('.trades-main-page .row.no-padding').slideDown();
	});
	// Load new giveaways
	$('.trades-main-page .row.no-padding').load(e.target.href+' .trade-cont',function(response, status, xhr){
		if ( status == "error" || xhr.status!==200) {
			location.replace(e.target.href);
		}
		showOwnedGames();
		$('img').on('error', function(){
			$(this).attr('src', 'http://i.imgur.com/eMShBmW.png');
		});
	});
  // Load new page nav
	$('.page-nav .row .col-xs-12').load(e.target.href+' .page-link-cont',function(response, status, xhr){
		if ( status == "error" || xhr.status!==200) {
			location.replace(e.target.href);
		}else{
			history.replaceState('data', '', e.target.href);
		}
	});
});

// Add app to Hidden apps
$(document).on('click','.mark-as-owned',function(e){markAsOwned(e.target);/*showOwnedGames();*/});
