
var myvar = '<link href="https://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css" rel="stylesheet">'+
'<div id="indiegala-helper">'+
'	<h2>IndieGala Helper </h2><br>'+
'	<div class="input-wrapper">'+
'		<label for="APIKey"><i class="fa fa-key fa-2x"></i></label><input type="text" id="APIKey" placeholder="API Key">'+
'		<p>'+
'			<a href="http://steamcommunity.com/dev/apikey" target="_BLANK">Get API Key</a> <span>→</span>'+
'		</p>'+
'	</div>'+
'	<div class="input-wrapper">'+
'		<label for="SteamID"><i class="fa fa-steam fa-2x"></i></label><input type="text" id="SteamID" placeholder="Steam ID 64">'+
'		<p>'+
'			<a href="https://steamid.io/lookup" target="_BLANK">Get Steam ID</a> <span>→</span>'+
'		</p>'+
'	</div>'+
'	<div class="input-wrapper">'+
'		<input type="submit" id="saveDetails" class="palette-background-1" value="Save Details"><br/>'+
'		<input type="submit" id="refreshOwned" class="palette-background-2" onclick="localStorage.removeItem(\'updatedOwnedApps\');localStorage.removeItem(\'ownedApps\');location.reload();"value="Refresh Owned Games">'+
'	</div>'+
'</div>';
function showOwnedGames(){
	var apps = JSON.parse(localStorage.getItem("ownedApps"));
	$.each(bundleApps,function(i,v){
		if(typeof apps[v] != "undefined"){
			$("[src$='"+v+".jpg']").parents(".bundle-item-cont").parent().addClass("owned");
		}
	});
}
$('.bundle_page').before(myvar);
apikey=false;
steamid=false;
if(localStorage.getItem("APIKey") != null && localStorage.getItem("APIKey").length >=32){
	$("#APIKey").val(localStorage.getItem("APIKey"));
	apikey=true;
}
if(localStorage.getItem("SteamID") != null && localStorage.getItem("SteamID").length >=1){
	$("#SteamID").val(localStorage.getItem("SteamID"));
	steamid=true;
}
$('#indiegala-helper h2').click(function(e){
	$('#indiegala-helper h2').toggleClass("open");
	$('#indiegala-helper .input-wrapper').slideToggle(250);
});
$('#saveDetails').click(function(e){
	e.preventDefault();
	localStorage.setItem("APIKey", $("#APIKey").val());
	localStorage.setItem("SteamID", $("#SteamID").val());
	alert("Details Saved!");
	try{getOwnedGames();showOwnedGames();}catch(e){console.log(e);}
});
var bundleApps = [];
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
function getOwnedGames(){
	if(!steamid || !apikey){
		$('#indiegala-helper h2').click();
		return;
	}else if (Number(localStorage.getItem("updatedOwnedApps"))<((new Date().getTime()/1000)-86400)){
		localStorage.removeItem('updatedOwnedApps');
		localStorage.removeItem('ownedApps');
		$.ajax({
			url:"https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key="+localStorage.getItem("APIKey")+"&format=json&steamid="+localStorage.getItem("SteamID")+"&include_appinfo=0&include_played_free_games=0",
			statusCode: {
				403: function() {
				  alert( "Invalid API Key,\nPlease Try Again!" );
				},
				500: function() {
				  alert( "Invalid Steam ID,\nPlease Try Again!" );
				}
			},
			success: function(response){
				var ownedApps={};
				var myApps = response.response.games;
				$.each(myApps,function(i,v){
					ownedApps[v.appid]="owned";
				})

				localStorage.setItem("ownedApps", JSON.stringify(ownedApps));
				localStorage.setItem("updatedOwnedApps", (new Date().getTime()/1000));
				try{showOwnedGames();}catch(e){console.log(e);}
			}
		});
	}else{
		try{showOwnedGames();}catch(e){console.log(e);}
	}
}
getOwnedGames();