
// const xhr = new XMLHttpRequest();
// xhr.onreadystatechange((data)=>{
//     // Error
//     $('#indiegala-helper-coins').text('error');
//
//     // Success
//     if (data.status === 'ok'){
//       $('#indiegala-helper-coins strong').text(data.silver_coins_tot);
//     } else {
//       $('#indiegala-helper-coins').text(data.status.replace('_', ' '));
//     }
// });
// xhr.open('GET', 'https://www.indiegala.com/get_user_info');
// xhr.send();

function updateGalaSilver(amount = undefined){
  console.log(amount);
  if (amount == undefined) {
    $.ajax({
      type: 'GET',
      url: 'https://www.indiegala.com/get_user_info',
      data: {
        'uniq_param': new Date().getTime(),
        'show_coins': 'True'
      },
      cache: false,
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
get_user_level();

// Mark owned games as owned || remove owned games from list || remove hidden apps
function showOwnedGames(){
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
    try { app_image = $('img', this)[0];                                                                                   }catch(O_o){}
    try { app_id = Number(app_image.dataset.imgSrc.match(/apps\/(\d+)\/header/)[1]) || 0;                                  }catch(O_o){}
    try { app_name = app_image.alt.replace(/\s*product\s*image\s*/,'');                                                    }catch(O_o){}
    try { giveaway_guaranteed = !!$('.items-list-item-type-guaranteed', this).length;                                      }catch(O_o){}
    try { giveaway_entered = !$('.items-list-item-ticket-click', this).length;                                             }catch(O_o){}
    try { giveaway_level = Number(($('.items-list-item-type span', this).text().match(/\d+/) || [0])[0]);                  }catch(O_o){}
    try { giveaway_participants = Number(($('.items-list-item-data-right-bottom', this).text().match(/\d+/) || [0])[0]);   }catch(O_o){}
    try { giveaway_price = Number($('[data-price]', this)[0].dataset.price) || 0;                                          }catch(O_o){}
    try { giveaway_extra_odds = /single ticket/i.test($('.items-list-item-type', this).text());                            }catch(O_o){}
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
          || !!settings.hide_owned_games && !!($.inArray(app_id, local_settings.owned_apps) + 1) // Remove if owned
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

    // Add link to steam store page
    $('.info-row', this).eq(2).html(`<i class="fa fa-steam" aria-hidden="true"></i> <a class="viewOnSteam" href="http://store.steampowered.com/app/${app_id}" target="_BLANK">View on Steam &rarr;</a>`);

    // Disable indiegala entry function on main page with `ajaxNewEntrySemaphore=false;` so it uses our function
    // $('.items-list-item-ticket-click', this).attr('onclick','joinGiveawayOrAuctionAJS=false;');

    // Add button to add to blacklist
    $('.ticket-left', this).prepend('<span class="mark-as-owned"> Add To Blacklist <i class="fa fa-times"></i></span>');

    // Show app image
    app_image.onload = function(){
      this.classList.remove('display-none');
    }
    app_image.src = app_image.dataset.imgSrc;

    $('.items-list-item-title a', this).eq(0).before(`<a class="view-on-steam" href="http://store.steampowered.com/app/${app_id}" target="_BLANK" alt="View on Steam"><i class="fa fa-steam" aria-hidden="true"></i></a>`);

  });

  // TODO: Fix infinite scrolling
  // If less than 4 apps on page & inifiniteScroll is enabled then load next page
  $('.page-contents-list-cont .items-list-item').not('.checked').addClass('checked').not('.item').fadeIn().length <= 4 && !!settings.infinite_scroll ? nextPage() : $('#indiegala-helper-pageloading').slideUp(() => {loading_page=false;});
}

// TODO: Fix auto enter
// Auto enter giveaways
// setInterval(() => {
//   if (!!page_loaded && !!settings.auto_enter_giveaways){
//     if ( Number($('#indiegala-helper-coins strong').html() ) > 0 ){
//       $('.tickets-col .animated-coupon').length > 0 ? $('.tickets-col .animated-coupon').eq(0).click() : (!loading_page ? nextPage() : false);
//     }
//   }
// }, 3000);

// TODO: Fix infinite scrolling
// Load next page via ajax
function nextPage(){
  loading_page=true;

  var url_address = $('.page-link-cont .current').eq(0).parent().next().find('a').attr('href');

  // If last page or undefined url return
  if (typeof url_address == 'undefined' || url_address == location.pathname){
    $('#indiegala-helper-pageloading').slideUp( () => { loading_page=false; });
    return;
  }

  history.replaceState('data', '', url_address);

  $('#indiegala-helper-pageloading').slideDown(250);
  var url_attr = url_address.split('/');
  var url = `https://www.indiegala.com${url_address}`;
  var settings = {
    processData: false,
    success: function(data){
      if (!data){
        nextPage();
        return;
      }
      data = $.parseHTML(data);
      $('.page-contents-list .items-list-row').append($('.page-contents-list .items-list-col', data));
      $('.pagination').parent().html($('.pagination', data));
      showOwnedGames();
    },
    error: () => {
      nextPage();
    }
  };
  $.ajax(url_address, settings);
}

// Set loading page as true, will be set to false once "showOwnedGames" is processed
let loading_page = true;
let page_loaded = false;

// Wait until indiegala loads the initial giveaways
const wait_for_page = setInterval(() => {
  if($('[href^="/giveaways/card"]').length >= 1){
    clearInterval(wait_for_page);
    page_loaded = true;
    // // Remove Indiegalas "Owned Games" overlay
    // $('.on-steam-library-text').remove();

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
    showOwnedGames();
  }
}, 500);

// If infinite scroll is checked then listen to scroll event and load more pages as needed
if (!!settings.infinite_scroll){
  $(window).scroll(function(){
    if (loading_page===false){
      var hT = $('.pagination').eq(1).offset().top,
        hH = $('.pagination').eq(1).outerHeight(),
        wH = $(window).height(),
        wS = $(this).scrollTop();
      if (wS > (hT+hH-wH)){
        nextPage();
      }
    }
  });
}

// Add apps to hidden apps list
$(document).on('click','.mark-as-owned',(e) => {markAsOwned(e.target);/*showOwnedGames();*/});

// Catch ajax calls, update coins on entry
const updateSilver = `
// Update silver remaining
$(document).ajaxComplete(function(event, res, settings){
  if (res.responseJSON && res.responseJSON.silver_tot >= 0) $('.coins-amount').text(res.responseJSON.silver_tot);;
});
// Allow entry on multiple giveaways at a time
$(document).on('click','.items-list-item-ticket-click',() => { joinGiveawayOrAuctionAJS=true; });
`;

const script = document.createElement('script');
script.textContent = updateSilver;
(document.head||document.documentElement).appendChild(script);
script.remove();
