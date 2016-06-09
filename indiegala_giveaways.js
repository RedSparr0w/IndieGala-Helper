$('body').append('<div id="indiegala-helper-coins" class="coins-amount" title="IndieGala Coin Balance"><strong>'+$('.coins-amount strong').eq(0).html()+'</strong><span> IC</span></div>');

function showOwnedGames(){
	//Add button to hide specific apps
	$('.ticket-left').not('.checked').addClass('checked').prepend('<span class="mark-as-owned">Hide This Game <i class="fa fa-times"></i></span>');
	
	//Figure out which apps are in the bundle
	var bundleApps = [];
	$('.tickets-col img.giv-game-img').each(function(i){ 
		var str = $(this).attr("src");
		var start;
		str.indexOf("apps/")>0 ? start = str.indexOf("apps/"):start = str.indexOf("dium/");
		var end = str.indexOf(".jpg");
		var gameID = str.substring(start+5,end);
		if(isNaN(Number(gameID))){
			$(this).parents(".tickets-col").find(".main").addClass("unknown").html("UNKNOWN?");
			return;
		}
		bundleApps.push(gameID);
		$(this).parents(".tickets-col").find(".info-row").eq(2).html('<i class="fa fa-steam" aria-hidden="true"></i> <a class="viewOnSteam" href="http://store.steampowered.com/app/'+gameID+'" target="_BLANK">View on Steam &rarr;</a>');
	});
	
	//get owned apps from local storage
	var apps = JSON.parse(localStorage.getItem("ownedApps"));
	
	//check if bundle app is in local storage and mark as owned
	$.each(bundleApps,function(i,v){
		if(typeof apps[v] != "undefined"){
			$("[src*='"+v+".jpg']").parents(".tickets-col").addClass("owned").find(".main").html("(owned)");
		}
	});
	
	//hide all user defined apps
	var apps = JSON.parse(localStorage.getItem("hiddenApps"));
	$.each(apps,function(i,app){
		$('img[alt="'+app+'"]').parents(".tickets-col").addClass("owned").find(".main").html("(hidden)");
	})
	//show unowned / non hidden apps
	$('.tickets-col.owned').fadeOut();
	$('.tickets-col').not('.owned').fadeIn();
}

getOwnedGames(showOwnedGames);

$(document).on('click','.page-link-cont,.sort-item a',function(e){
	e.preventDefault();
	//Scroll to top of section
	$('html, body').animate({
		scrollTop: $(".sort-menu").offset().top-80
	}, 1000);
	//hide old giveaways - show loading symbol
	$('.tickets-row').slideUp(function(){
		$('.tickets-row').html('<i class="fa fa-refresh fa-5x fa-spin" id="indiegala-helper-pageloading"></i>');
		$('.tickets-row').slideDown();
	});
	//Load new giveaways
	$('.giveaways').load(e.target.href+' .giveaways-main-page',function(response, status, xhr){
		if ( status == "error" || xhr.status!==200) {
			location.replace(e.target.href);
		}
		getOwnedGames(showOwnedGames);
		$('.animated-coupon').attr("onclick","handleCoupon(event)");
		$('.sort-item a').each(function(){
			var order = $(this).attr( 'rel' );
			var orderValue = $('.fa', $(this)).attr( 'rel' );
			var url = '/giveaways/1/'+order+'/'+orderValue;
			$(this).attr("href",url);
		});
		$('img').on('error', function(){
			$(this).attr('src','/img/trades/img_not_available.png');
		});
	});
});

$(document).on('click','.mark-as-owned',function(e){markAsOwned(e.target);showOwnedGames();});