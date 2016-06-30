version = chrome.runtime.getManifest().version;
if (localStorage.getItem("version")===null){
	localStorage.setItem("version",version);
	$(window).load(function(){
		notifyMe("Click here to setup IndieGala Helper!").onclick = function(){
			$('#indiegala-helper-header h2').click();
		}
	});
} else if (localStorage.getItem("version") < version){
	localStorage.setItem("version",version);
}

var myvar = '<div id="indiegala-helper-header">'+
'	<h2 data-toggle="modal" data-target="#indiegala-helper">IndieGala Helper </h2>'+
'</div>'+
'<div id="indiegala-helper" class="modal fade" role="dialog">'+
'	<div class="modal-dialog">'+
'		<div class="modal-content">'+
'			<div class="modal-header">'+
'				<button type="button" class="close" data-dismiss="modal">×</button>'+
'				<ul class="nav nav-tabs">'+
'					<li class="active"><a data-toggle="tab" href="#IGH_setup">Setup</a></li>'+
'					<li><a data-toggle="tab" href="#IGH_Options">Options</a></li>'+
'					<li><a data-toggle="tab" href="#IGH_HiddenGames">Hidden Games</a></li>'+
'				</ul>'+
'			</div>'+
'			<div class="modal-body tab-content">'+
'				<div id="IGH_setup" class="tab-pane fade in active">'+
'					<div class="input-wrapper">'+
'						<label for="SteamID"><i class="fa fa-steam fa-3x"></i></label>'+
'						<input type="text" id="SteamID" placeholder="Steam ID 64">'+
'						<p>'+
'							<a href="https://steamid.io/lookup" target="_BLANK">Get Steam ID →</a>'+
'						</p>'+
'					</div>'+
'					<div class="input-wrapper">'+
'						<input type="submit" id="saveDetails" class="palette-background-1" value="Save Details"><br/>'+
'						<input type="submit" id="refreshOwned" class="palette-background-2" value="Refresh Owned Games">'+
'					</div>'+
'				</div>'+
'				<div id="IGH_Options" class="tab-pane fade">'+
'					<h3>General</h3>'+
'					<div class="input-group">'+
'						<label for="showActivateWindow">'+
'							<span class="input-group-addon check"><input type="checkbox" data-option="showActivateWindow" id="showActivateWindow"><span></span></span>'+
'							<span class="input-group-addon name">Show steam activate window on key select</span>'+
'						</label>'+
'					</div>'+
'					<h3>Giveaways</h3>'+
'					<div class="input-group">'+
'						<label for="hideEnteredGiveaways">'+
'							<span class="input-group-addon check"><input type="checkbox" data-option="hideEnteredGiveaways" id="hideEnteredGiveaways" checked="true"><span></span></span>'+
'							<span class="input-group-addon name">Hide entered giveaways</span>'+
'						</label>'+
'					</div>'+
'					<h3>Profile</h3>'+
'					<div class="input-group">'+
'						<label for="removeAnimationCheckAll">'+
'							<span class="input-group-addon check"><input type="checkbox" data-option="removeAnimationCheckAll" id="removeAnimationCheckAll"><span></span></span>'+
'							<span class="input-group-addon name">No animation for lost giveaways</span>'+
'						</label>'+
'					</div>'+
'				</div>'+
'				<div id="IGH_HiddenGames" class="tab-pane fade">'+
'					<h2>Hidden Games Tab</h2>'+
'				</div>'+
'			</div>'+
'			<div class="modal-footer">'+
'				<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>'+
'			</div>'+
'		</div>'+
'	</div>'+
'</div>';

$('.header-placeholder').after(myvar);

/* FUNCTIONS */

//Create notifications
function notifyMe(body,title="IndieGala Helper",icon="https://www.indiegala.com/img/og_image/indiegala_icon.jpg") {//set title and icon if not included
	if (!("Notification" in window)) {//check if notifications supported
		return;
	}
	else if (Notification.permission === "granted") {//check if notifications permission granted
		return new Notification(title,{body:body,icon:icon});
	}
	else if (Notification.permission !== 'denied') {//check that permissions are not denied
		Notification.requestPermission(function (permission) {//ask user for permission to create notifications
			if (permission === "granted") {//if permission granted create notification
				return new Notification(title,{body:body,icon:icon});
			}
		});
	}
}
//Get users owned games
function getOwnedGames(callback){
	if (steamid == true && Number(localStorage.getItem("updatedOwnedApps"))<new Date().getTime()-(86400*1000)){//check if we have a steamID & see how long ago we checked (24 hours)
		$.ajax({
			dataType:"json",
			url:"https://api.enhancedsteam.com/steamapi/GetOwnedGames/?steamid="+localStorage.getItem("SteamID")+"&include_appinfo=0&include_played_free_games=1",
			success: function(res){
				var ownedApps={};
				var myApps = res.response.games;
				$.each(myApps,function(i,v){
					ownedApps[v.appid]="1";
				})
				//Set owned apps
				localStorage.setItem("ownedApps", JSON.stringify(ownedApps));
				//Set current time as last updated time
				localStorage.setItem("updatedOwnedApps", new Date().getTime());
				notifyMe("Owned Games List Updated!");
			},
			error: function(e){
				//Don't check for atleast another 30 minutes - Steam may be down
				var checkNext = Number(localStorage.getItem("updatedOwnedApps"))+(1800*1000);
				localStorage.setItem("updatedOwnedApps", checkNext);
			}
		});
	}
	//Set owned apps variable
	ownedApps = JSON.parse(localStorage.getItem("ownedApps"));
	if (!callback){
		try{
			showOwnedGames();
		}catch(e){
			return;
		}
	}else{
		callback();
	}
}

function markAsOwned(e){
	var appImg = $(e).parent().find('img').attr("alt");
	//if not string or less than 1 char long then do nothing (avoid nulls)
	if (typeof appImg !== "string" || appImg.length < 1){
		return;
	}
	hiddenApps.push(appImg);
	localStorage.setItem("hiddenApps",JSON.stringify(hiddenApps.sort()));
	$('#IGH_HiddenGames').html("");
	hiddenApps.forEach(function(v,i){
		$('#IGH_HiddenGames').append('<div class="input-group"><span class="input-group-addon name">'+v+'</span><span class="input-group-addon remove"><i class="fa fa-times IGH_UnHide" style="color:white;"></i></span></div>');
	});
}

function saveCheckboxOption(){
		localStorage.setItem(this.dataset.option, this.checked);
};

/* Check and set values */
$('#IGH_Options input[type=checkbox]').each(function(){
	try{
		switch(localStorage.getItem(this.dataset.option)){
			case null:
				throw "not set";
				break;
			case "true":
			case true:
				$(this).attr("checked",true);
				break;
			default:
				$(this).removeAttr("checked");
		}
	}catch(e){
		localStorage.setItem(this.dataset.option, this.checked);
	}
});
$('#IGH_Options input[type=checkbox]').on('change', saveCheckboxOption);


try{
	hiddenApps = JSON.parse(localStorage.getItem("hiddenApps"));
	hiddenApps = hiddenApps.filter(function(val) {
		switch(val){
			case null:
			case "":
				break;
			default:
				return val;
		}
	}).join(';').split(';');
}catch(e){
	hiddenApps = [];
}finally{
	localStorage.setItem("hiddenApps",JSON.stringify(hiddenApps.sort()));
	hiddenApps.forEach(function(v,i){
		$('#IGH_HiddenGames').append('<div class="input-group"><span class="input-group-addon name">'+v+'</span><span class="input-group-addon remove"><i class="fa fa-times IGH_UnHide" style="color:white;"></i></span></div>');
	});
}

switch(localStorage.getItem("ownedApps")){
	case null:
		localStorage.setItem("ownedApps",JSON.stringify({}));
	default:
		ownedApps = JSON.parse(localStorage.getItem("ownedApps"));
}

steamid=false;
if(localStorage.getItem("SteamID") != null && localStorage.getItem("SteamID").length >=3){
	$("#SteamID").val(localStorage.getItem("SteamID"));
	steamid=true;
}


/* Assign Function To Events */
$('#saveDetails').click(function(e){
	e.preventDefault();
	if ($("#SteamID").val().length >=5){
		localStorage.setItem("SteamID", $("#SteamID").val());
		steamid=true;
		notifyMe("Details Saved!");
		getOwnedGames();
	}else{
		notifyMe("Steam ID too short!");
	}
});

$('#refreshOwned').click(function(e){
	try{
		localStorage.removeItem("updatedOwnedApps");
	}finally{
		location.reload();
	}
});

$(document).on("click",".remove",function(){
	var app = $(this).prev().html();
	$(this).parents(".input-group").remove();
	hiddenApps.splice(hiddenApps.indexOf(app), 1);
	localStorage.setItem("hiddenApps",JSON.stringify(hiddenApps));
});

$(document).on("click","input.keys , .serial-won input",function(){
	try{
		$(this).select();
		document.execCommand('copy');
		switch(localStorage.getItem("showActivateWindow")){
			case "true":
			case true:
				window.location.href = "steam://open/activateproduct";
		}
	}catch(e){
		return;
	}
});