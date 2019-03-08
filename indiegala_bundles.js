var bundleApps = [];

// Mark owned games and get values of cards
function showOwnedGames(){
	// Wait for page to load games
	if ($('.carousel-game-item').length <= 0){
		setTimeout(() => { showOwnedGames(); }, 1000);
		return;
	}
	// Once games loaded to page get app ids
	$('.carousel-game-item').each(function(){
		let apps_total_cards_value = 0;
		let app_id = Number($(this).attr('rel'));

		// Mark games as owned
		if( !!($.inArray(app_id, local_settings.owned_apps) + 1) ){
			$(`[src$='${app_id}.jpg']`).parents('.bundle-item-container').parent().addClass('owned');
		}

		// Get card values
		bundleApps.push(app_id);
		/*
		$.ajax({
			url: `https://api.enhancedsteam.com/market_data/card_prices/?appid=${app_id}`,
			success: function(result){
				if (typeof result !== 'object'){
					return;
				}
				$.each(result, (index, value) => {
					if (value.game.indexOf('Foil') <= 0){
						apps_total_cards_value += Number(value.price);
					}
				});

				// Divide the total by 2 as you get half the total cards as free drops
				let discount = Number((apps_total_cards_value/2).toFixed(2));
				$(`[src$='${app_id}.jpg']`).parents('.bundle-item-padding').find('span[class^=\'trading-\']').append(` ($${discount.toFixed(2)})`);
			}
		});
		*/
	});
}
showOwnedGames();
