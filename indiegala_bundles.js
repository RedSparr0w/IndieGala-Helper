function showOwnedGames(){
	if ($('.carousel-game-item').length <= 0){
		setTimeout(function(){
			showOwnedGames();
		},1000);
		return;
	}
	$('.carousel-game-item').each(function(i){
		var cardsValue = 0;
		var gameID = $(this).attr('rel');
		bundleApps.push(gameID);
		$.ajax({
			url: "https://api.enhancedsteam.com/market_data/card_prices/?cur=usd&appid="+gameID,
			success: function(result){
				if (typeof result !== "object"){
					return;
				}
				$.each(result,function(index,value){
					if (value.game.indexOf("Foil") <= 0) {
						cardsValue += Number(value.price);
					}
				});
				var discount = Number((cardsValue/2).toFixed(2));
				$("[src$='"+gameID+".jpg']").parents(".bundle-item-padding").find('.palette-background-1').append(' ($'+discount.toFixed(2)+")");
			}
		});
	});
	$.each(bundleApps,function(i,v){
		if(typeof ownedApps[v] != "undefined"){
			$("[src$='"+v+".jpg']").parents(".bundle-item-cont").parent().addClass("owned");
		}
	});
}

bundleApps = [];

getOwnedGames(showOwnedGames);