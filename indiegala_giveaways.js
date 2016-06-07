function showOwnedGames(){
	var apps = JSON.parse(localStorage.getItem("ownedApps"));
	$.each(bundleApps,function(i,v){
		if(typeof apps[v] != "undefined"){
			$("[src*='"+v+".jpg']").parents(".ticket-cont").addClass("owned").find(".main").html("(owned)");
		}
	});
	if (localStorage.getItem("hideOwnedApps")==="true"){
		$('.owned').fadeOut(400,function(){$(this).parent().remove();});
	}
}

var bundleApps = [];

$('.ticket-cont img.giv-game-img').each(function(i){ 
	var str = $(this).attr("src");
	var start;
	str.indexOf("apps/")>0 ? start = str.indexOf("apps/"):start = str.indexOf("dium/");
	var end = str.indexOf(".jpg");
	var gameID = str.substring(start+5,end);
	if(isNaN(Number(gameID))){
		$(this).parents(".ticket-cont").find(".main").addClass("unknown").html("UNKNOWN?");
		return;
	}
	bundleApps.push(gameID);
	$(this).parents(".ticket-cont").find(".info-row").eq(2).html('<i class="fa fa-steam" aria-hidden="true"></i> <a class="viewOnSteam" href="http://store.steampowered.com/app/'+gameID+'" target="_BLANK">View on Steam &rarr;</a>');
});

getOwnedGames(showOwnedGames);