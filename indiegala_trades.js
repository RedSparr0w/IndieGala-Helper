function showOwnedGames(){
	//Add button to hide specific apps
	$('.ticket-left').not('.checked').addClass('checked').prepend('<span class="mark-as-owned">Hide This Game <i class="fa fa-times"></i></span>');
	
	//Figure out which apps are in trades
	var tradeApps = [];
	$('.trade-cont img[src*=apps]').each(function(i){ 
		var str = $('.trade-cont img[src*=apps]').eq(i).attr("src");
		var start = str.indexOf("apps/");
		var end = str.indexOf("/header.jpg");
		var gameID = str.substring(start+5,end);
		tradeApps.push(gameID);
		$(this).parents(".trade-cont").find(".read-more").html('<i class="fa fa-steam" aria-hidden="true"></i> <a class="viewOnSteam" href="http://store.steampowered.com/app/'+gameID+'" target="_BLANK">View on Steam &rarr;</a>');
	});
	
	//get owned apps from local storage
	var apps = JSON.parse(localStorage.getItem("ownedApps"));
	
	//check if trade app is in local storage and mark as owned
	$.each(tradeApps,function(i,v){
		if(typeof apps[v] != "undefined"){
			$("[src*='"+v+"/header.jpg']").parents(".trade-cont").addClass("owned").find(".main").html("(owned)");
		}
	});
	
	//hide all user defined apps
	var apps = JSON.parse(localStorage.getItem("hiddenApps"));
	$.each(apps,function(i,app){
		$('img[alt="'+app+'"]').parents(".trade-cont").addClass("owned").find(".main").html("(hidden)");
	})
	//show unowned / non hidden apps
	$('.trade-cont.owned').fadeOut();
	$('.trade-cont').not('.owned').fadeIn();
}

getOwnedGames(showOwnedGames);
$(document).on('click','.page-link-cont',function(e){
	e.preventDefault();
	//Scroll to top of section
	$('html, body').animate({
		scrollTop: $(".search-type-cont").offset().top-80
	}, 1000);
	//hide old giveaways - show loading symbol
	$('.trades-main-page .row.no-padding').slideUp(1000,function(){
		$('.trades-main-page .row.no-padding').html('<i class="fa fa-refresh fa-5x fa-spin" id="indiegala-helper-pageloading"></i>');
		$('.trades-main-page .row.no-padding').slideDown();
	});
	//Load new giveaways
	$('.trades-main-page .row.no-padding').load(e.target.href+' .trade-cont',function(response, status, xhr){
		if ( status == "error" || xhr.status!==200) {
			location.replace(e.target.href);
		}
		getOwnedGames(showOwnedGames);
	});
	$('.page-nav .row .col-xs-12').load(e.target.href+' .page-link-cont',function(response, status, xhr){
		if ( status == "error" || xhr.status!==200) {
			location.replace(e.target.href);
		}
	});
});

$(document).on('click','.mark-as-owned',function(e){markAsOwned(e.target);showOwnedGames();});