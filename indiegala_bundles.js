

// Mark owned games and get values of cards
function showOwnedApps(){
	const bundleApps = [];

	// Once games loaded to page get app ids
	$('.bundle-page-tier-item-col').each(function(){
		// Check if this app has trading cards
		// if (/no\s*trading\s*cards/i.test($('.bundle-page-tier-item-trading', this).eq(0).text())) continue;

		let app_id = 0;
		try { app_id = +$('img', this)[0].src.match(/\/(\d+)\.jpg/)[1]; }catch(O_o){ app_id = 0; }

		// Couldn't determine app_id try the next one
		if (!app_id) return;

		// Mark games as owned
		if(local_settings.owned_apps.includes(app_id)){
			$(this).addClass('owned');
		}

		bundleApps.push(app_id);
	});

	// Get card values
	$.ajax({
		url: `https://indiegala.redsparr0w.com/steamAPI/getCardPrices?apps=${bundleApps.join(',')}`,
		success: function(result){
			if (typeof result !== 'object'){
				return;
			}

			bundleApps.forEach(app_id => {
				// Divide the total by 2 as you get half the total cards as free drops
				if (result[app_id]){
					$(`[src*='${app_id}.jpg']`).parents('.bundle-page-tier-item-col').find('.bundle-page-tier-item-trading').append(` [$${(Math.floor(result[app_id] / 2) / 100).toFixed(2)}]`);
				}
			});
		}
	});
}

// Wait until indiegala loads the initial bundle page
const wait_for_page = setInterval(() => {
  if($('.bundle-page-tier-item-col').length >= 1){
    clearInterval(wait_for_page);
    page_loaded = true;

    // Show owned apps
    showOwnedApps();
  }
}, 500);
