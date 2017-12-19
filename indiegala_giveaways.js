function getGalaSilver(){
	$('body').append('<div id="indiegala-helper-coins" class="coins-amount" title="IndieGala Coin Balance"><strong><i class="fa fa-spinner fa-spin"></i></strong><span> <img src="/img/gala-silver.png"/></span></div>');
	$.ajax({
		type: 'GET',
		url: 'https://www.indiegala.com/get_user_info',
		data: {
			'uniq_param': new Date().getTime(),
			'show_coins': 'True'
		},
		cache: false,
		dataType: 'json',
		success: function(data) {
			if (data.status === 'ok') {
				$('#indiegala-helper-coins strong').text(data.silver_coins_tot);
			} else {
				$('#indiegala-helper-coins').text(data.status.replace('_', ' '));
			}
		},
		error: function(xhr, ajaxOptions, thrownError){
			$('#indiegala-helper-coins').text('error');
		}
	});
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
		let app_id = Number($('.giveaway-game-id', this).val()) || 0;
		let app_image = $('img', this);
		let app_name = app_image.attr('alt');
		let giveaway_guaranteed = ($('.type-level-cont', this).text().match(/((not\s)?guaranteed)/i) || [0])[0] == "guaranteed";
		let giveaway_level = Number(($('.type-level-cont', this).text().match('[0-9]+') || [0])[0]);
		let giveaway_participants = Number(($('.box_pad_5', this).text().match(/([0-9]+) participants/i) || [0,0])[1]);
		let giveaway_price = Number($('.ticket-price strong', this).text()) || 0;
		let giveaway_extra_odds = !!($('.extra-type', this).text().match(/extra odds/i) || [0])[0];
		let do_not_remove = !!settings.always_show_guaranteed && !!giveaway_guaranteed; // Keep if guaranteed

		if ( !do_not_remove && (
          typeof local_settings.blacklist_apps[app_id] != "undefined" // Remove If Blacklisted
          || !!settings.hide_not_guaranteed && !giveaway_guaranteed // Remove if "not guaranteed"
          || !!settings.hide_high_level_giveaways && giveaway_level > settings.current_level // Remove if above users level
          || !!settings.hide_extra_odds && !!giveaway_extra_odds // Remove if "extra odds"
          || !!settings.hide_above_price && giveaway_price > settings.hide_above_price // Remove if above defined price
          || !!settings.hide_above_participants && giveaway_participants > settings.hide_above_participants // Remove if above defined participants
          || !!settings.hide_soundtracks && !!(app_name.toLowerCase().indexOf("soundtrack") + 1) // Remove If Soundtrack
          || !!settings.hide_owned_games && !!($.inArray(app_id, local_settings.owned_apps) + 1) // Remove if owned
        )
      ){
      $(this).remove();
      return;
		}

		// Add class if above users level
		if (giveaway_level > settings.current_level){
      $(this).addClass("higher-level");
		}

		// Add class If Owned
		if ( !!($.inArray(app_id, local_settings.owned_apps) + 1) ){
      $(this).addClass("owned");
		}

		// Add link to steam store page
		$(".info-row", this).eq(2).html(`<i class="fa fa-steam" aria-hidden="true"></i> <a class="viewOnSteam" href="http://store.steampowered.com/app/${app_id}" target="_BLANK">View on Steam &rarr;</a>`);

		// Disable indiegala entry function on main page with `ajaxNewEntrySemaphore=false;` so it uses our function
		$('.animated-coupon', this).attr("onclick","ajaxNewEntrySemaphore=false;");

		// Add button to add to blacklist
		$('.ticket-left', this).prepend('<span class="mark-as-owned"> Add To Blacklist <i class="fa fa-times"></i></span>');

		// Show app image
		app_image.on('error', function(){
      $(this).attr('src','//i.imgur.com/eMShBmW.png');
    }).attr('src', app_image.attr('data-src'));
  });

	// If less than 4 apps on page & inifiniteScroll is enabled then load next page
  $('.tickets-col').not(".checked").addClass("checked").not('.item').fadeIn().length <= 4 && !!settings.infinite_scroll ? nextPage() : $('#indiegala-helper-pageloading').slideUp(function(){loading_page=false;});
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
		var url_address = $('a.prev-next').eq(5).attr('href');
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
				if (!data.content){
					nextPage();
					return;
				}
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
	if($('.tickets-col').length >= 12){
		clearInterval(wait_for_page);
		page_loaded = true;
		// Remove extra spacing
		$('.tickets-row .spacer-v-30:not(:first-child)').remove()
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
			$this.css('right','-50px').css('opacity','0');
			setTimeout(function(){
				$this.remove();
			}, 500);
		}
	});
}

// Enter Giveaways via ajax function
function handleCoupons(e){
	$this = $(e);

	$this.removeClass( 'animated-coupon' );

	if ( $this.hasClass( 'low-coins' ) ){
		handleCouponError($this, 'insufficient_credit');
		$this.css('right','-50px').css('opacity','0');
		setTimeout(function(){
			$this.remove();
		}, 500);
		return false;
	}else{
		var parentCont 			= $this.parent().parent().parent();
		var ticketPrice 		= $( '.ticket-price strong', parentCont ).text();
		var data_to_send = {}
		data_to_send['giv_id'] 				= $this.parent().attr('rel');
		data_to_send['ticket_price'] 		= ticketPrice;

		$.ajax({
			type: "POST",
			url: 'https://www.indiegala.com/giveaways/new_entry',
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			data: JSON.stringify(data_to_send),
			context: $this,
			success: function(data){
				if ( data['status'] == 'ok' ){
					$( '.coins-amount strong' ).text( data['new_amount'] );
					$( '.extra-data-participants .title strong' ).text( parseInt($( '.extra-data-participants .title strong' ).text())+1 );
					$this.css('right','-50px').css('opacity','0');
					setTimeout(function(){
						$this.remove();
					}, 500);
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
