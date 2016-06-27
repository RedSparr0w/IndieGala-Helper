version = chrome.runtime.getManifest().version;
function notifyMe(body,title="IndieGala Helper",icon="https://www.indiegala.com/img/og_image/indiegala_icon.jpg") {
	if (!("Notification" in window)) {
		return;
	}
	else if (Notification.permission === "granted") {
		return new Notification(title,{body:body,icon:icon});
	}
	else if (Notification.permission !== 'denied') {
		Notification.requestPermission(function (permission) {
			if (permission === "granted") {
				return new Notification(title,{body:body,icon:icon});
			}
		});
	}
}
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
function getOwnedGames(callback){
	if (steamid == true && Number(localStorage.getItem("updatedOwnedApps"))<new Date().getTime()-(86400*1000)){
		$.ajax({
			dataType:"json",
			url:"https://api.enhancedsteam.com/steamapi/GetOwnedGames/?steamid="+localStorage.getItem("SteamID")+"&include_appinfo=0&include_played_free_games=1",
			success: function(res){
				var ownedApps={};
				var myApps = res.response.games;
				$.each(myApps,function(i,v){
					ownedApps[v.appid]="owned";
				})

				localStorage.setItem("ownedApps", JSON.stringify(ownedApps));
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
	hiddenApps = JSON.parse(localStorage.getItem("hiddenApps"));
	hiddenApps.push(appImg);
	localStorage.setItem("hiddenApps",JSON.stringify(hiddenApps));
	$('#IGH_HiddenGames').html("");
	hiddenApps.forEach(function(v,i){
		$('#IGH_HiddenGames').append('<div class="input-group"><span class="input-group-addon name">'+v+'</span><span class="input-group-addon remove"><i class="fa fa-times IGH_UnHide" style="color:white;" data-val="'+i+'"></i></span></div>');
	});
}

function saveCheckboxOption(){
		localStorage.setItem(this.dataset.option, this.checked);
};

/* Check and set values */
$('#IGH_Options input[type=checkbox]').each(function(){
	try{
		var optionVal = localStorage.getItem(this.dataset.option);
		if (optionVal === null){
			throw "not set";
		}else if (optionVal === "true" || optionVal === true){
			$(this).attr("checked",true);
		}else{
			$(this).removeAttr("checked");
		}
	}catch(e){
		localStorage.setItem(this.dataset.option, this.checked);
	}
});
$('#IGH_Options input[type=checkbox]').on('change', saveCheckboxOption);

if(localStorage.getItem("hiddenApps") == null){
	localStorage.setItem("hiddenApps",JSON.stringify([]));
}
if(localStorage.getItem("ownedApps") == null){
	localStorage.setItem("ownedApps",JSON.stringify({}));
}

steamid=false;
if(localStorage.getItem("SteamID") != null && localStorage.getItem("SteamID").length >=3){
	$("#SteamID").val(localStorage.getItem("SteamID"));
	steamid=true;
}

ownedApps = JSON.parse(localStorage.getItem("ownedApps"));
hiddenApps = JSON.parse(localStorage.getItem("hiddenApps"));

/* Assign Function To Events */
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
		getOwnedGames();
	}catch(e){
		location.reload();
	}
});

$(document).ready(function(){
	var hiddenApps = JSON.parse(localStorage.getItem("hiddenApps"));
	$('#IGH_HiddenGames').html("");
	hiddenApps.forEach(function(v,i){
		$('#IGH_HiddenGames').append('<div class="input-group"><span class="input-group-addon name">'+v+'</span><span class="input-group-addon remove"><i class="fa fa-times IGH_UnHide" style="color:white;" data-val="'+i+'"></i></span></div>');
	});
});

$(document).on("click",".IGH_UnHide",function(){
	$(this).parent().parent().remove();
	var app = $(this).attr("data-val");
	var hiddenApps = JSON.parse(localStorage.getItem("hiddenApps"));
	hiddenApps.splice(app, 1);
	localStorage.setItem("hiddenApps",JSON.stringify(hiddenApps));
});

$(document).on("click","input.keys , .serial-won input",function(){
	try{
		$(this).select();
		document.execCommand('copy');
		if (localStorage.getItem("showActivateWindow") === "true" || localStorage.getItem("showActivateWindow") === true){
			window.location.href = "steam://open/activateproduct";
		}
	}catch(e){
		return;
	}
});