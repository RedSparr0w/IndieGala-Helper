function getGalaSilver(){
	try{
		var galaSilver = Number($('.account-galamoney').html().match(/\d+/)[0]);
    $('body').append(`<div id="indiegala-helper-coins" class="coins-amount" title="IndieGala Coin Balance"><strong>${galaSilver}</strong><span> <img src="/img/gala-silver.png"/></span></div>`);
	}catch(e){
    setTimeout(getGalaSilver, 1000);
	}
}
get_user_level();

// Mark owned games as owned || remove owned games from list || remove hidden apps
function showOwnedGames(){
	$('.giv-coupon').addClass('animated-coupon');
	$('.giv-coupon-link').removeAttr("href");
	
	// Remove Entered Giveaways
	if (!!settings.hide_entered_giveaways){
		$('.tickets-col:not(.checked)').not(':has(.animated-coupon)').remove();
	}
	
	$('.tickets-col:not(.checked)').each(function(i){
		let app_id = Number($(this).find('.giveaway-game-id').val());
		let app_image = $(this).find('img');
		let app_name = app_image.attr('alt');
		let giveaway_level = Number($('.type-level-cont', this).text().match('[0-9]+')[0]);
		let giveaway_participants = Number($('.box_pad_5', this).text().match(/([0-9]+) participants/)[1])
		let giveaway_price = Number($('.ticket-price strong', this).text());
		
		// Check if app_id is valid
		if (isNaN(app_id)){ app_id = 0; }
		// Remove if above users level
		if (giveaway_level > settings.current_level){
			if(!!settings.hide_high_level_giveaways){
				$(this).remove();
				return;
			}else{
				$(this).addClass("higher-level");
			}
		}
		// Remove if above defined price
		if (!!settings.hide_above_price && giveaway_price > settings.hide_above_price){
			$(this).remove();
			return;
		}
		// Remove if above defined participants
		if (!!settings.hide_above_participants && giveaway_participants > settings.hide_above_participants){
			$(this).remove();
			return;
		}
		// Remove If Soundtrack
		if (!!settings.hide_soundtracks && !!(app_name.toLowerCase().indexOf("soundtrack") + 1) ){
			$(this).remove();
			return;
		}
		// Remove If Blacklisted
		if (typeof settings.blacklist_apps[app_id] != "undefined"){
			$(this).remove();
			return;
		}
		// Remove/Display If Owned
		if ( !!($.inArray(app_id, local_settings.owned_apps) + 1) ){
			if (!!settings.hide_owned_games){
				$(this).remove();
				return;
			}else{
				$(this).addClass("owned");
			}
		}
		// Add link to steam store page
		$(this).find(".info-row").eq(2).html(`<i class="fa fa-steam" aria-hidden="true"></i> <a class="viewOnSteam" href="http://store.steampowered.com/app/${app_id}" target="_BLANK">View on Steam &rarr;</a>`);
		// Show app image
		app_image.attr('src', app_image.attr('data-src'));
	});
	
	$('img').on('error', function(){
		$(this).attr('src','http://i.imgur.com/eMShBmW.png');
	});
	
	// Allow entry from main page
	$('.animated-coupon').not('.checked').addClass('checked').attr("onclick","ajaxNewEntrySemaphore=true;");
	
	// Add button to add to blacklist
	$('.ticket-left').not('.checked').addClass('checked').prepend('<span class="mark-as-owned"> Add To Blacklist <i class="fa fa-times"></i></span>');
  
	//If less than 2 apps on page & inifiniteScroll then load next page
  if (!!settings.infinite_scroll) {
		$('.tickets-col').not(".checked").addClass("checked").not('.item').fadeIn().length <= 4 ? nextPage() : $('#indiegala-helper-pageloading').slideUp(function(){loading_page=false;});
	} else {
		$('.tickets-col').not(".checked").addClass("checked").not('.item').fadeIn();
		$('#indiegala-helper-pageloading').slideUp( function(){ loading_page=false; });
	}
}

// Auto enter giveaways
setInterval(function(){
	if (!!page_loaded && !!settings.auto_enter_giveaways){
    if ( Number($('#indiegala-helper-coins strong').html() ) > 0 ){
      $('.tickets-col .animated-coupon').length > 0 ? $('.tickets-col .animated-coupon').eq(0).click() : (!loading_page ? nextPage() : false);
    }
	}
}, 3000);

// Load next page via ajax
function nextPage(){
		loading_page=true;
		var url_address = $('a.prev-next').eq(2).attr('href');
		// If last page or undefined url return
		if (typeof url_address == "undefined" || url_address == location.pathname){
			$('#indiegala-helper-pageloading').slideUp( function(){ loading_page=false; });
			return;
		}
		
		$('#indiegala-helper-pageloading').slideDown(250);
		var url_attr = url_address.split('/');
		var url = `https://www.indiegala.com/giveaways/ajax_data/list?page_param=${url_attr[2]}&order_type_param=${url_attr[3]}&order_value_param=${url_attr[4]}&filter_type_param=${url_attr[5]}&filter_value_param=${url_attr[6]}`;
		var settings = {
			dataType: 'json',
			processData:false,
			success: function(data) {
				data = $.parseHTML(data.content);
				$('.tickets-row').append($('.tickets-col', data));
				$('.page-nav').parent().html($('.page-nav', data));
				history.replaceState('data', '', 'https://www.indiegala.com' + url_address);
				showOwnedGames();
			},
			error: function() {
				nextPage();
			}
		}
		$.ajax(url,settings);
}

// Set loading page as true, will be set to false once "showOwnedGames" is processed
var loading_page = true;
var page_loaded = false;

// Wait until indiegala loads the initial giveaways
var wait_for_page = setInterval(function(){
	if($('.tickets-col').length >= 24){
		clearInterval(wait_for_page);
		page_loaded = true;
		// Remove Indiegalas Placeholder Giveaways
		$('.giv-placeholder').remove();
		// Remove Indiegalas "Owned Games" overlay
		$('.on-steam-library-text').remove();
		// Show current coin balance
		getGalaSilver();
		// Add infinite page loading spinner
		$('.tickets-row').after('<i class="fa fa-refresh fa-5x fa-spin" id="indiegala-helper-pageloading"></i>');
		// Show page numbers at top & bottom of page
		$('.page-nav').parent().clone().insertAfter('.sort-menu');
		// Show/Remove giveaways based on user settings
		showOwnedGames();
	}
}, 500);

// If infinite scroll is checked then listen to scroll event and load more pages as needed
if (!!settings.infinite_scroll){
	$(window).scroll(function() {
		if (loading_page===false){
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

// Add apps to hidden apps list
$(document).on('click','.mark-as-owned',function(e){markAsOwned(e.target);/*showOwnedGames();*/});
// Enter Giveaways without opening new tabs via ajax
$(document).on('click','.animated-coupon',function(e){handleCoupons(this);});

// If request to enter giveaway is unsuccessful handle error code
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
			errorMsg = `Error: "${status}". Try again in a few minutes.`;
	}
	$('.warning-text span', parentCont).text(errorMsg);
	warningCover.toggle('clip', function(){
		setTimeout( function(){ warningCover.toggle('clip') }, 4000);
		if (clipTicket === true){
			$this.remove();
		}
	});
}

// Enter Giveaways via ajax function
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
				handleCouponError( $( this ), 'unknown error' );
			}
		});
	}
}