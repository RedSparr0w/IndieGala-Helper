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
var myvar = '<link href="https://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css" rel="stylesheet">'+
'<div id="indiegala-helper-header">'+
'	<h2 data-toggle="modal" data-target="#indiegala-helper">IndieGala Helper </h2>'+
'</div>'+
'<div id="indiegala-helper" class="modal fade" role="dialog">'+
'	<div class="modal-dialog modal-sm">'+
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
'					<h2>Coming Soon</h2>'+
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
	if(!steamid){
		return;
	}else if (Number(localStorage.getItem("updatedOwnedApps"))<new Date().getTime()-(86400*1000)){
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
				notifyMe("Something went wrong while trying to get Owned Games,\nPlease Try Refresh Owned Games!");
			}
		});
	}else{
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
}

function markAsOwned(e){
	var appImg = $(e).parent().find('img').attr("alt");
	var hiddenApps = JSON.parse(localStorage.getItem("hiddenApps"));
	hiddenApps.push(appImg);
	localStorage.setItem("hiddenApps",JSON.stringify(hiddenApps));
	$('#IGH_HiddenGames').html("");
	hiddenApps.forEach(function(v,i){
		$('#IGH_HiddenGames').append('<div class="input-group"><span class="input-group-addon name">'+v+'</span><span class="input-group-addon remove"><i class="fa fa-times IGH_UnHide" style="color:white;" data-val="'+i+'"></i></span></div>');
	});
}

/* Check and set values */
if(localStorage.getItem("hiddenApps") == null){
	localStorage.setItem("hiddenApps",JSON.stringify([]));
}

steamid=false;
if(localStorage.getItem("SteamID") != null && localStorage.getItem("SteamID").length >=1){
	$("#SteamID").val(localStorage.getItem("SteamID"));
	steamid=true;
}else{
	$(document).ready(function(){
		notifyMe("Click here to setup IndieGala Helper!").onclick = function(){
			$('#indiegala-helper-header h2').click();
		}
	});
}

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
		localStorage.removeItem('ownedApps');
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