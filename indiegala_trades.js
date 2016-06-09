function showOwnedGames(){
	var apps = JSON.parse(localStorage.getItem("ownedApps"));
	$.each(bundleApps,function(i,v){
		if(typeof apps[v] != "undefined"){
			$("[src*='"+v+"/header.jpg']").parents(".trade-cont").addClass("owned");
		}
	});
	if (localStorage.getItem("hideOwnedApps")==="true"){
		$('.owned').parent().fadeOut();
	}
}

var bundleApps = [];

$('.trade-cont img[src*=apps]').each(function(i){ 
	var str = $('.trade-cont img[src*=apps]').eq(i).attr("src");
	var start = str.indexOf("apps/");
	var end = str.indexOf("/header.jpg");
	var gameID = str.substring(start+5,end);
	bundleApps.push(gameID);
	$(this).parents(".trade-cont").find(".read-more").html('<i class="fa fa-steam" aria-hidden="true"></i> <a class="viewOnSteam" href="http://store.steampowered.com/app/'+gameID+'" target="_BLANK">View on Steam &rarr;</a>');
});

getOwnedGames(showOwnedGames);