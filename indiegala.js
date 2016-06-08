function notifyMe(body,title="IndieGala Helper",icon="https://www.indiegala.com/img/og_image/indiegala_icon.jpg") {
	if (!("Notification" in window)) {
		return;
	}
	else if (Notification.permission === "granted") {
		new Notification(title,{body:body,icon:icon});
	}
	else if (Notification.permission !== 'denied') {
		Notification.requestPermission(function (permission) {
			if (permission === "granted") {
				new Notification(title,{body:body,icon:icon});
			}
		});
	}
}

var myvar = '<link href="https://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css" rel="stylesheet">'+
'<div id="indiegala-helper">'+
'	<h2>IndieGala Helper </h2><br>'+
'	<!--<div class="input-wrapper">'+
'		<label for="APIKey"><i class="fa fa-key fa-2x"></i></label><input type="text" id="APIKey" placeholder="API Key">'+
'		<p>'+
'			<a href="http://steamcommunity.com/dev/apikey" target="_BLANK">Get API Key</a> <span>→</span>'+
'		</p>'+
'	</div>-->'+
'	<div class="input-wrapper">'+
'		<label for="SteamID"><i class="fa fa-steam fa-2x"></i></label><input type="text" id="SteamID" placeholder="Steam ID 64">'+
'		<p>'+
'			<a href="https://steamid.io/lookup" target="_BLANK">Get Steam ID</a> <span>→</span>'+
'		</p>'+
'	</div>'+
'	<div class="input-wrapper">'+
'		<input type="submit" id="saveDetails" class="palette-background-1" value="Save Details"><br/>'+
'		<input type="submit" id="refreshOwned" class="palette-background-2" value="Refresh Owned Games">'+
'		<br/><span><input id="hideOwnedApps" type="checkbox" /> Hide Owned Apps? | (Giveaways & Trades)</span>'+
'	</div>'+
'</div>';

$('.header-placeholder').after(myvar);

/* FUNCTIONS */
function openIndeGalaHelper(){
	$('#indiegala-helper h2').addClass("open");
	$('#indiegala-helper .input-wrapper').slideDown(250);
}

function getOwnedGames(callback){
	if(!steamid){
		openIndeGalaHelper();
		return;
	}else if (Number(localStorage.getItem("updatedOwnedApps"))<new Date().getTime()-(86400*1000)){
		localStorage.removeItem('updatedOwnedApps');
		localStorage.removeItem('ownedApps');
		$.ajax({
			dataType:"json",
			url:"https://api.enhancedsteam.com/steamapi/GetOwnedGames/?steamid="+localStorage.getItem("SteamID")+"&include_appinfo=0&include_played_free_games=0",
			success: function(res){
				var ownedApps={};
				var myApps = res.response.games;
				$.each(myApps,function(i,v){
					ownedApps[v.appid]="owned";
				})

				localStorage.setItem("ownedApps", JSON.stringify(ownedApps));
				localStorage.setItem("updatedOwnedApps", new Date().getTime());
				notifyMe("Owned Games List Updated!");
				if (!callback){
					showOwnedGames();
				}else{
					callback();
				}
			},
			error: function(e){
				notifyMe("Something Went Wrong,\nPlease Try Refresh Owned Games!\nError: "+JSON.stringify(e));
			}
		});
	}else{
		if (!callback){
			showOwnedGames();
		}else{
			callback();
		}
	}
}

/* Check and set values */
if(localStorage.getItem("hideOwnedApps") != null){
	if(localStorage.getItem("hideOwnedApps")==="true"){
		$("#hideOwnedApps").attr("checked",true);
	}
}else{
	openIndeGalaHelper();
	$("#hideOwnedApps").focus();
	notifyMe("You can now choose to hide owned apps!\n- giveaways and trades pages only");
	localStorage.setItem("hideOwnedApps",false);
}

steamid=false;

if(localStorage.getItem("SteamID") != null && localStorage.getItem("SteamID").length >=1){
	$("#SteamID").val(localStorage.getItem("SteamID"));
	steamid=true;
}else{
	openIndeGalaHelper();
	$("#SteamID").focus();
}

/* Assign Function To Events */
$('#indiegala-helper h2').click(function(e){
	$('#indiegala-helper h2').toggleClass("open");
	$('#indiegala-helper .input-wrapper').slideToggle(250);
});

$('#saveDetails').click(function(e){
	e.preventDefault();
	try{
		localStorage.setItem("SteamID", $("#SteamID").val());
		if (typeof localStorage.getItem("SteamID") != "undefined" && localStorage.getItem("SteamID") != null && localStorage.getItem("SteamID").length >=1){
			steamid=true;
			notifyMe("Details Saved!");
		}
		getOwnedGames();
	}catch(e){
		notifyMe("Error:\n"+e);
	}
});

$('#refreshOwned').click(function(e){
	try{
		$(".owned").removeClass("owned");
		localStorage.removeItem('updatedOwnedApps');
		localStorage.removeItem('ownedApps');
		getOwnedGames();
	}catch(e){
		location.reload();
	}
});

$("#hideOwnedApps").click(function(){
	$(this).is(":checked") ? localStorage.setItem("hideOwnedApps",true) : localStorage.setItem("hideOwnedApps",false);
	$(this).is(":checked") ? $('.owned').parent().fadeOut() : $('.owned').parent().fadeIn();
});
