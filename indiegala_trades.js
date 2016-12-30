// Add page navigation to bottom of page aswell
$('.page-nav').parent().clone().insertAfter('.search-cont');
function showOwnedGames(){
	// Add button to hide specific apps
	$('.trade_img').not('.checked').addClass('checked').prepend('<span class="mark-as-owned">Hide This Game <i class="fa fa-times"></i></span>');
	// Get App ID's && Names
	$('.trade-cont img[src*=apps]').not('.checked').addClass('checked').each(function(i){ 
		var str = $(this).attr("src");
		var start,end;
		str.indexOf("apps/") > 0 ? start = str.indexOf("apps/"):start = str.indexOf("dium/");
		str.indexOf("/header.jpg")>0 ? end = str.indexOf("/header.jpg"):end = str.indexOf(".jpg");
		var gameID = str.substring(start+5,end);
		if(isNaN(Number(gameID))){
			return;
		}
		if(typeof ownedApps[gameID] != "undefined"){
			if (localStorage.getItem("hideOwnedGames") === "true" || localStorage.getItem("hideOwnedGames") === true){
				$(this).parents(".trade-cont").remove();
				return;
			}else{
				$(this).parents(".trade-cont").addClass("owned").find(".main").html("(owned)");
			}
		}
		$(this).parents(".trade-cont").find(".read-more").html('<i class="fa fa-steam" aria-hidden="true"></i> <a class="viewOnSteam" href="http://store.steampowered.com/app/'+gameID+'" target="_BLANK">View on Steam &rarr;</a>');
	}).on('error', function(){
		$(this).attr('src','/img/trades/img_not_available.png');
	});
	
	// Hide all user defined apps
	$.each(hiddenApps,function(i,app){
		$('img[alt="'+app.replace(/"/g,'\\"')+'"]').parents(".trade-cont").remove();
	})
	// Show remaining apps
	$('.trade-cont').fadeIn();
}

// Check owned games list is upto date
getOwnedGames(showOwnedGames);

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
		getOwnedGames(showOwnedGames);
		$('img').on('error', function(){
			$(this).attr('src','/img/trades/img_not_available.png');
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
$(document).on('click','.mark-as-owned',function(e){markAsOwned(e.target);showOwnedGames();});