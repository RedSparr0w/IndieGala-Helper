$('.on-steam-library-text').remove();
$('body').append('<div id="indiegala-helper-coins" class="coins-amount" title="IndieGala Coin Balance"><strong>'+$('.coins-amount strong').eq(0).html()+'</strong><span> IC</span></div>');
$('.tickets-row').after('<i class="fa fa-refresh fa-5x fa-spin" id="indiegala-helper-pageloading"></i>');
$('.page-nav').parent().clone().insertAfter('.sort-menu');

function showOwnedGames(){
	$('.ticket-cont.on-steam-library').parent().remove();
	$('.tickets-col img.giv-game-img:not(.checked)').addClass('checked').each(function(i){ 
		var str = $(this).attr("src");
		var start;
		str.indexOf("apps/")>0 ? start = str.indexOf("apps/"):start = str.indexOf("dium/");
		var end = str.indexOf(".jpg");
		var gameID = str.substring(start+5,end);
		if(isNaN(Number(gameID))){
			return;
		}
		if (typeof ownedApps[gameID] != "undefined"){
			$(this).parents(".tickets-col").remove();
		}
		$(this).parents(".tickets-col").find(".info-row").eq(2).html('<i class="fa fa-steam" aria-hidden="true"></i> <a class="viewOnSteam" href="http://store.steampowered.com/app/'+gameID+'" target="_BLANK">View on Steam &rarr;</a>');
	}).on('error', function(){
		$(this).attr('src','/img/trades/img_not_available.png');
	});
	
	$.each(hiddenApps,function(i,app){
		$('img[alt="'+app+'"]').parents(".tickets-col").remove();
	})
	//show unowned / non hidden apps
	if (localStorage.getItem("hideEnteredGiveaways") === "true" || localStorage.getItem("hideEnteredGiveaways") === true){
		$('.tickets-col:not(.checked)').not(':has(.animated-coupon)').remove();
	}
	//remove all leftover owned
	$('.owned').remove();
	//Add onclick attr to coupons - enter as fast as you want
	$('.animated-coupon').not('.checked').addClass('checked').attr("onclick","ajaxNewEntrySemaphore=true;handleCoupon(event);");
	//Add button to hide specific apps
	$('.ticket-left').not('.checked').addClass('checked').prepend('<span class="mark-as-owned">Hide This Game <i class="fa fa-times"></i></span>');
	//If less than 2 apps on page then load next page
	$('.tickets-col').not(".checked").addClass("checked").not('.item').fadeIn().length <= 2 ? nextPage() : setTimeout(function(){
		$('#indiegala-helper-pageloading').slideUp(250)
		loadingPage=false;
	},100);
}

function nextPage(){
		loadingPage=true;
		$('#indiegala-helper-pageloading').slideDown(250);
		var url = $('.prev-next').eq(2).attr('href');
		var settings = {
			processData:false,
			success: function(data) {
				var t0 = performance.now();
				$('.tickets-row').append($('.tickets-col', data));
				$('.page-nav').parent().html($('.page-nav', data))
				console.log("HTML took " + (performance.now() - t0) + "ms.");
				history.replaceState('data', '', 'https://www.indiegala.com'+url);
				var t0 = performance.now();
				showOwnedGames();
				console.log("Show Owned Games took " + (performance.now() - t0) + "ms.");
			},
			error: function() {
				nextPage();
			}
		}
		$.ajax(url,settings);
}

getOwnedGames(showOwnedGames);

loadingPage=false;

$(window).scroll(function() {
	var hT = $('.page-nav').eq(1).offset().top,
		hH = $('.page-nav').eq(1).outerHeight(),
		wH = $(window).height(),
		wS = $(this).scrollTop();
	if (wS > (hT+hH-wH) && loadingPage===false){
		nextPage();
	}
});

$(document).on('click','.mark-as-owned',function(e){markAsOwned(e.target);showOwnedGames();});