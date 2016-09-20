$('.on-steam-library-text').remove();
$('body').append('<div id="indiegala-helper-coins" class="coins-amount" title="IndieGala Coin Balance"><strong>'+$('.coins-amount strong').eq(0).html()+'</strong><span> IC</span></div>');
$('.tickets-row').after('<i class="fa fa-refresh fa-5x fa-spin" id="indiegala-helper-pageloading"></i>');
$('.page-nav').parent().clone().insertAfter('.sort-menu');

function showOwnedGames(){
	$('.giv-coupon').addClass('animated-coupon');
	$('.giv-coupon-link').removeAttr("href");
	$('.tickets-col:not(.checked)').each(function(i){
		var gameID = $(this).find('.giveaway-game-id').val();
		if(isNaN(Number(gameID))){
			return;
		}
		if (typeof ownedApps[gameID] != "undefined"){
			$(this).remove();
		}
		$(this).find(".info-row").eq(2).html('<i class="fa fa-steam" aria-hidden="true"></i> <a class="viewOnSteam" href="http://store.steampowered.com/app/'+gameID+'" target="_BLANK">View on Steam &rarr;</a>');
	});
	$('img').on('error', function(){
		$(this).attr('src','/img/trades/img_not_available.png');
	});
	
	$.each(hiddenApps,function(i,app){
		$('img[alt="'+app.replace(/"/g,'\\"')+'"]').parents(".tickets-col").remove();
	})
	//show unowned / non hidden apps
	if (localStorage.getItem("hideEnteredGiveaways") === "true" || localStorage.getItem("hideEnteredGiveaways") === true){
		$('.tickets-col:not(.checked)').not(':has(.animated-coupon)').remove();
	}
	//remove all leftover owned
	$('.owned').remove();
	$('.animated-coupon').not('.checked').addClass('checked').attr("onclick","ajaxNewEntrySemaphore=true;");
	
	//Add button to hide specific apps
	$('.ticket-left').not('.checked').addClass('checked').prepend('<span class="mark-as-owned">Hide This Game <i class="fa fa-times"></i></span>');
	//If less than 2 apps on page then load next page
	if (localStorage.getItem("autoEnterGiveaways") === "true" || localStorage.getItem("autoEnterGiveaways") === true){
		$('.tickets-col').not(".checked").addClass("checked").not('.item').fadeIn();
		if ( Number($('#indiegala-helper-coins strong').html() ) > 0 ){
			$('.animated-coupon').click();
			nextPage();
		}else{
			$('#indiegala-helper-pageloading').slideUp(function(){loadingPage=false;});
		}
	} else if (localStorage.getItem("infiniteScroll") === "true" || localStorage.getItem("infiniteScroll") === true) {
		$('.tickets-col').not(".checked").addClass("checked").not('.item').fadeIn().length <= 2 ? nextPage() : $('#indiegala-helper-pageloading').slideUp(function(){loadingPage=false;});
	} else {
		$('.tickets-col').not(".checked").addClass("checked").not('.item').fadeIn();
		$('#indiegala-helper-pageloading').slideUp( function(){ loadingPage=false; });
	}
}

function nextPage(){
		loadingPage=true;
		$('#indiegala-helper-pageloading').slideDown(250);
		var url = $('.prev-next').eq(2).attr('href');
		if (typeof url == "undefined"){
			$('#indiegala-helper-pageloading').slideUp( function(){ loadingPage=false; });
			return;
		}
		var settings = {
			processData:false,
			success: function(data) {
				var main = $('.giveaways-main-page',data);
				$('.tickets-row').append($('.tickets-col', main));
				$('.page-nav').parent().html($('.page-nav', main));
				history.replaceState('data', '', 'https://www.indiegala.com'+url);
				showOwnedGames();
			},
			error: function() {
				nextPage();
			}
		}
		$.ajax(url,settings);
}

getOwnedGames(showOwnedGames);

loadingPage=true;

if (localStorage.getItem("infiniteScroll") === "true" || localStorage.getItem("infiniteScroll") === true){
	$(window).scroll(function() {
		if (loadingPage===false){
			var hT = $('.page-nav').eq(1).offset().top,
				hH = $('.page-nav').eq(1).outerHeight(),
				wH = $(window).height(),
				wS = $(this).scrollTop();
			if (wS > (hT+hH-wH)){
				nextPage();
			}
		}
	});
}
$(document).on('click','.mark-as-owned',function(e){markAsOwned(e.target);showOwnedGames();});
$(document).on('click','.animated-coupon',function(e){handleCoupons(this);});

function handleCouponError($this, status){
	var parentCont 			= $this.parent().parent().parent();
	var warningCover 		= $( '.warning-cover', parentCont );
	var clipTicket 			= true;
	var errorMsg;
	switch(status){
		case 'duplicate':
			errorMsg = 'Duplicate entry. Please choose another giveaway.';
			break;
		case 'insufficient_credit':
			errorMsg = 'Insufficient Indiegala Coins. Please choose a cheaper giveaway.'; 
			break;
		case 'unauthorized':
			errorMsg = 'You are not authorized access for this giveaway.';
			break;
		case 'not_logged':
			errorMsg = 'You are not logged. Please login or sign to join this giveaway.';
			break;
		case 'not_available':
			errorMsg = 'Sorry but this giveaway is no longer available.';
			break;
		default:
			clipTicket = false;
			errorMsg = 'Error. Try again in a few minutes.';
	}
	$('.warning-text span', parentCont).text(errorMsg);
	warningCover.toggle('clip', function(){
		setTimeout( function(){ warningCover.toggle('clip') }, 4000);
		if (clipTicket === true){
			$this.remove();
		}
	});
}

function handleCoupons(e){
	$this = $(e);
	
	$this.removeClass( 'animated-coupon' );
	
	if ( $this.hasClass( 'low-coins' ) ){ 
		handleCouponError($this, 'insufficient_credit'); 
		$( this ).animate({
			right: "+=-100",
			opacity: 0,
		}, 500, function(){
			$( this ).remove();
			return false;
		});
	}else{
		var parentCont 			= $this.parent().parent().parent();
		var ticketPrice 		= $( '.ticket-price strong', parentCont ).text();
		var data_to_send = {}
		data_to_send['giv_id'] 				= $this.parent().attr('rel');
		data_to_send['ticket_price'] 		= ticketPrice;

		$.ajax({
			type: "POST",
			url: '/giveaways/new_entry',
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			data: JSON.stringify(data_to_send),
			context: $this,
			success: function(data){
				if ( data['status'] == 'ok' ){ 
					$( '.coins-amount strong' ).text( data['new_amount'] );
					$( '.extra-data-participants .title strong' ).text( parseInt($( '.extra-data-participants .title strong' ).text())+1 );
					$( this ).animate({
						right: "+=-100",
						opacity: 0,
					}, 500, function(){
						$( this ).remove();
					});
				}else{ 
					handleCouponError( $( this ), data['status'] );
				}
			}, 
			error: function(){ 
				handleCouponError( $( this ), false );
			}
		});
	}
}