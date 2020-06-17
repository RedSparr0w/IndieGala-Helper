/* global getUserLevel, addToBlacklist */

// Enable dark mode
if (settings.dark_mode) document.body.classList.add('dark-mode');

function updateGalaSilver(amount = undefined){
	if (amount == undefined){
		$.ajax({
			cache: false,
			type: 'GET',
			url: 'https://www.indiegala.com/get_user_info',
			data: {
				'show_coins': 'True'
			},
			dataType: 'json',
			success: function(data){
				if (data.status === 'ok'){
					$('.coins-amount').text(data.silver_coins_tot);
				} else {
					$('.coins-amount').text(data.status.replace('_', ' '));
				}
			},
			error: function(xhr, ajaxOptions, thrownError){
				$('.coins-amount').text('error');
			}
		});
	} else {
		$('.coins-amount').text(amount);
	}
}
getUserLevel();

// Mark owned games as owned || remove owned games from list || remove hidden apps
function showOwnedApps(){
	$('.page-contents-list-cont .items-list-col:not(.checked)').each(function(){
		let app_image,
			app_id = 0,
			app_name = '',
			giveaway_guaranteed = false,
			giveaway_entered = false,
			giveaway_level = 0,
			giveaway_participants = 0,
			giveaway_price = 0,
			giveaway_extra_odds = false;
		try { app_image = $('img', this)[0];                                                                                   }catch(ಠ_ಠ){ /* DO NOTHING */ }
		try { app_id = Number(app_image.dataset.imgSrc.match(/\/(\d+)\/header/)[1]) || 0;                                      }catch(ಠ_ಠ){ /* DO NOTHING */ }
		try { app_name = app_image.alt.replace(/\s*product\s*image\s*/,'') || '';                                              }catch(ಠ_ಠ){ /* DO NOTHING */ }
		try { giveaway_guaranteed = !!$('.items-list-item-type-guaranteed', this).length;                                      }catch(ಠ_ಠ){ /* DO NOTHING */ }
		try { giveaway_entered = !$('.items-list-item-ticket-click', this).length;                                             }catch(ಠ_ಠ){ /* DO NOTHING */ }
		try { giveaway_level = Number(($('.items-list-item-type span', this).text().match(/\d+/) || [0])[0]);                  }catch(ಠ_ಠ){ /* DO NOTHING */ }
		try { giveaway_participants = Number(($('.items-list-item-data-right-bottom', this).text().match(/\d+/) || [0])[0]);   }catch(ಠ_ಠ){ /* DO NOTHING */ }
		try { giveaway_price = Number($('[data-price]', this)[0].dataset.price) || 0;                                          }catch(ಠ_ಠ){ /* DO NOTHING */ }
		try { giveaway_extra_odds = !/single ticket/i.test($('.items-list-item-type', this).text());                           }catch(ಠ_ಠ){ /* DO NOTHING */ }
		const do_not_remove = !!settings.always_show_guaranteed && !!giveaway_guaranteed; // Keep if guaranteed

		if ( !do_not_remove && (
			typeof local_settings.blacklist_apps[app_id] != 'undefined' // Remove If Blacklisted
          || !!settings.hide_not_guaranteed && !giveaway_guaranteed // Remove if "not guaranteed"
          || !!settings.hide_entered_giveaways && giveaway_entered // Remove entered giveaways
          || !!settings.hide_high_level_giveaways && giveaway_level > settings.current_level // Remove if above users level
          || !!settings.hide_extra_odds && !!giveaway_extra_odds // Remove if "extra odds"
          || !!settings.hide_above_price && giveaway_price > settings.hide_above_price // Remove if above defined price
          || !!settings.hide_above_participants && giveaway_participants > settings.hide_above_participants // Remove if above defined participants
          || !!settings.hide_soundtracks && !!(app_name.toLowerCase().indexOf('soundtrack') + 1) // Remove If Soundtrack
          || !!settings.hide_owned_games && local_settings.owned_apps.includes(app_id) // Remove if owned
		)
		){
			$(this).remove();
			return;
		}

		// Add class if above users level
		if (giveaway_level > settings.current_level){
			$(this).addClass('higher-level');
		}

		// Add class If Owned
		if ( !!($.inArray(app_id, local_settings.owned_apps) + 1) ){
			$(this).addClass('owned');
		}

		// Disable indiegala entry function on main page with `ajaxNewEntrySemaphore=false;` so it uses our function
		// $('.items-list-item-ticket-click', this).attr('onclick','joinGiveawayOrAuctionAJS=false;');


		// Show app image
		app_image.onload = function(){
			this.classList.remove('display-none');
		};
		app_image.src = app_image.dataset.imgSrc;

		// Add button to add to blacklist
		$('.items-list-item-title a', this).eq(0).before('<a class="add-to-blacklist" href="#add-to-blacklist" alt="Add to blacklist"><i class="fa fa-times" aria-hidden="true"></i></a>');
		$('.add-to-blacklist', this).on('click', (e) => {
			e.preventDefault();
			if (confirm(`Are you sure you want to blacklist this app?\n${app_id}: ${app_name}`))
				addToBlacklist(app_id, app_name);
		});
		// Add link to steam store page
		$('.items-list-item-title a', this).eq(0).before(`<a class="view-on-steam" href="https://store.steampowered.com/app/${app_id}" target="_BLANK" alt="View on Steam"><i class="fa fa-steam" aria-hidden="true"></i></a>`);

	});

	// If less than 4 apps on page & inifiniteScroll is enabled then load next page
	$('.page-contents-list-cont .items-list-col').not('.checked').addClass('checked').fadeIn().length <= 4 && !!settings.infinite_scroll ? nextPage() : $('#indiegala-helper-pageloading').slideUp(() => {loading_page=false;});
}

// Load next page via ajax
function nextPage(){
	loading_page=true;

	const url_address = $('.page-link-cont .current').eq(0).parent().next().find('a').attr('href');

	// If last page or undefined url return
	if (!url_address || url_address == location.pathname){
		$('#indiegala-helper-pageloading').slideUp(() => {
			loading_page=false;
		});
		return;
	}

	history.replaceState('data', '', url_address);

	$('#indiegala-helper-pageloading').slideDown(250);
	const options = {
		cache: false,
		processData: false,
		success: (data) => {
			if (!data){
				nextPage();
				return;
			}
			data = $.parseHTML(data);
			$('.page-contents-list .items-list-row').append($('.page-contents-list .items-list-col', data));
			$('.pagination').parent().html($('.pagination', data));
			showOwnedApps();
		},
		error: () => {
			nextPage();
		}
	};
	$.ajax(url_address, options);
}

// Set loading page as true, will be set to false once "showOwnedApps" is processed
let loading_page = true;

// Wait until indiegala loads the initial giveaways
const wait_for_page = setInterval(() => {
	if($('[href^="/giveaways/card"]').length >= 1){
		clearInterval(wait_for_page);

		// Add coin balance display to side of screen
		$('body').append('<div id="indiegala-helper-coins" title="IndieGala Coin Balance"><strong class="coins-amount"><i class="fa fa-spinner fa-spin"></i></strong><span> <img src="/img/gala-silver.png"/></span></div>');
		$('#galasilver-amount').addClass('coins-amount');
		// Update current coin balance
		updateGalaSilver();
		// // Add infinite page loading spinner
		$('.page-contents-list-cont .page-contents-list').after('<i class="fa fa-refresh fa-5x fa-spin" id="indiegala-helper-pageloading"></i>');
		// Show page numbers at top & bottom of page
		$('.pagination').parent().parent().clone().insertAfter('.page-contents-list-menu');
		// Show/Remove giveaways based on user settings
		showOwnedApps();

		// TODO: Fix auto enter
		// Auto enter giveaways
		// if (!!settings.auto_enter_giveaways){
		// 	setInterval(() => {
		//     if ( Number($('#indiegala-helper-coins strong').html() ) > 0 ){
		//       $('.tickets-col .animated-coupon').length > 0 ? $('.tickets-col .animated-coupon').eq(0).click() : (!loading_page ? nextPage() : false);
		//     }
		// 	}, 3000);
		// }
	}
}, 500);

// If infinite scroll is checked then listen to scroll event and load more pages as needed
if (!!settings.infinite_scroll){
	$(window).scroll(function(){
		if (loading_page===false){
			const hT = $('.pagination').eq(1).offset().top,
				hH = $('.pagination').eq(1).outerHeight(),
				wH = $(window).height(),
				wS = $(this).scrollTop();
			if (wS > (hT+hH-wH)){
				nextPage();
			}
		}
	});
}

// Catch ajax calls, update coins on entry
const updateSilver = `
// Update silver remaining
try {
	$(document).ajaxComplete(function(event, res, settings){
	  if (res.responseJSON && res.responseJSON.silver_tot >= 0) $('.coins-amount').text(res.responseJSON.silver_tot);;
	});
}catch(ಠ_ಠ){ /* DO NOTHING */ }

// Allow entry on multiple giveaways at a time
try {
	$(document).on('click','.items-list-item-ticket-click',() => { joinGiveawayOrAuctionAJS=true; });
}catch(ಠ_ಠ){ /* DO NOTHING */ }
`;

// Add the script to the page
const script = document.createElement('script');
script.textContent = updateSilver;
(document.head||document.documentElement).appendChild(script);
script.remove();
