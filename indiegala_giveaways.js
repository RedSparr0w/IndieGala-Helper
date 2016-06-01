function showOwnedGames(){
	var apps = JSON.parse(localStorage.getItem("ownedApps"));
	$.each(bundleApps,function(i,v){
		if(typeof apps[v] != "undefined"){
			$("[src*='"+v+".jpg']").parents(".ticket-cont").addClass("owned").find(".main").html("(owned)");
		}
	});
}

var bundleApps = [];

$('.ticket-cont img[src*=apps]').each(function(i){ 
	var str = $('.ticket-cont img[src*=apps]').eq(i).attr("src");
	var start = str.indexOf("apps/");
	var end = str.indexOf(".jpg");
	bundleApps.push(str.substring(start+5,end));
});

getOwnedGames(showOwnedGames);