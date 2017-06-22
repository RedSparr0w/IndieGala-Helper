// Get extension current version
const version = chrome.runtime.getManifest().version;
var hiddenApps = [];

// Create Notifications
function notifyMe(body,title="IndieGala Helper",icon="https://www.indiegala.com/img/og_image/indiegala_icon.jpg",closeOnClick=true) {//set title and icon if not included
	let notification = false;
	if (!("Notification" in window)) {//check if notifications supported
		return notification;
	}
	else if (Notification.permission === "granted") {//check if notifications permission granted
		notification = new Notification(title,{body:body,icon:icon});
		if (!!closeOnClick){
			notification.onclick = function(){
				this.close()
			}
		}
		return notification;
	}
	else if (Notification.permission !== 'denied') {//check that permissions are not denied
		Notification.requestPermission(function (permission) {//ask user for permission to create notifications
			if (permission === "granted") {//if permission granted create notification
				notification = new Notification(title,{body:body,icon:icon});
				if (!!closeOnClick){
					notification.onclick = function(){
						this.close()
					}
				}
				return notification;
			}
		});
	}
}

// If version not set, assume new user, else assume updated
if (localStorage.getItem("version")===null){
	localStorage.setItem("version",version);
	/* show options modal when notification clicked *
	$(window).load(function(){
		notifyMe("Click here to setup IndieGala Helper!").onclick = function(){
			$('#OpenIndieGalaHelper').click();
		}
	});
	//*/
} else if (localStorage.getItem("version") != version){
	localStorage.setItem("version",version);
	/* Display notification relaying update */
	if(!notifyMe('Removed auto entry for giveaways, Also can no longer enter giveaways from the main screen, You will have to go into each one individually.\n(Thanks IndieGala)\n- v'+version, 'IndieGala Helper Updated')){
		alert('IndieGala Helper Updated\n' + 'Removed auto entry for giveaways, Also can no longer enter giveaways from the main screen, You will have to go into each one individually.\n(Thanks IndieGala)\n- v'+version);
	}
	//*/
}

// Indiegala Helper Menu
$('#log-in-status-cont').after(`
<li><a id="OpenIndieGalaHelper" class="libd-group-item libd-bounce libd-group-item-icon" href="#" data-toggle="modal" data-target="#indiegala-helper"> IndieGala Helper</a></li>
<div id="indiegala-helper" class="modal fade" role="dialog">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal">×</button>
				<ul class="nav nav-tabs">
					<li class="active"><a data-toggle="tab" href="#IGH_setup">Setup</a></li>
					<li><a data-toggle="tab" href="#IGH_Options">Options</a></li>
					<li><a data-toggle="tab" href="#IGH_HiddenGames">Hidden Games</a></li>
				</ul>
			</div>
			<div class="modal-body tab-content">
				<div id="IGH_setup" class="tab-pane fade in active">
					<div class="input-wrapper">
						<label for="SteamID"><i class="fa fa-steam fa-3x"></i></label>
						<input type="text" id="SteamID" placeholder="Steam ID 64">
						<p>
							<a href="https://steamid.io/lookup" target="_BLANK">Get Steam ID →</a>
						</p>
					</div>
					<div class="input-wrapper">
						<input type="submit" id="saveDetails" class="palette-background-1" value="Save Details"><br/>
						<input type="submit" id="refreshOwned" class="palette-background-2" value="Refresh Owned Games">
					</div>
				</div>
				<div id="IGH_Options" class="tab-pane fade">
					<h3>General</h3>
						<label for="showActivateWindow">
							<span class="input-group-addon check"><input type="checkbox" data-option="showActivateWindow" id="showActivateWindow"><span></span></span>
							<span class="input-group-addon name">Show steam activate window on key select</span>
						</label>
					<h3>Giveaways</h3>
						<label for="hideOwnedGames">
							<span class="input-group-addon check"><input type="checkbox" data-option="hideOwnedGames" id="hideOwnedGames" checked="true"><span></span></span>
							<span class="input-group-addon name">Hide owned games</span>
						</label>
						<label for="hideEnteredGiveaways">
							<span class="input-group-addon check"><input type="checkbox" data-option="hideEnteredGiveaways" id="hideEnteredGiveaways" checked="true"><span></span></span>
							<span class="input-group-addon name">Hide entered giveaways</span>
						</label>
						<label for="infiniteScroll">
							<span class="input-group-addon check"><input type="checkbox" data-option="infiniteScroll" id="infiniteScroll" checked="true"><span></span></span>
							<span class="input-group-addon name">Infinite scroll</span>
						</label>
						<label for="autoEnterGiveaways">
							<span class="input-group-addon check"><input type="checkbox" data-option="autoEnterGiveaways" id="autoEnterGiveaways"><span></span></span>
							<span class="input-group-addon name">Auto enter giveaways (until 0 coins remain)</span>
						</label>
						<label for="hideOwnedGames">
							<span class="input-group-addon name">Create New Giveaway Default Message<br/><textarea data-option="newGiveawayMessage" id="newGiveawayMessage" style="width:80%" rows="3">${localStorage.newGiveawayMessage || "GLHF"}</textarea></span>
							<span class="input-group-addon"><span></span></span>
						</label>
					<h3>Profile</h3>
						<label for="removeAnimationCheckAll">
							<span class="input-group-addon check"><input type="checkbox" data-option="removeAnimationCheckAll" id="removeAnimationCheckAll"><span></span></span>
							<span class="input-group-addon name">No animation for lost giveaways</span>
						</label>
				</div>
				<div id="IGH_HiddenGames" class="tab-pane fade">
          <div id="hiddengame_list"></div>
          <br/>
          <a id="backupHiddenApps" class="btn btn-success">Backup List</a>
          <label for="importHiddenApps">
            <a class="btn btn-warning">Import Backup</a>
            <input type="file" id="importHiddenApps" value="Import" accept=".json" style="display:none" />
          </label>
				</div>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
			</div>
		</div>
	</div>
</div>`);

// Get users owned apps
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
				// Get owned apps
				localStorage.setItem("ownedApps", JSON.stringify(ownedApps));
				// Set current time as last updated time
				localStorage.setItem("updatedOwnedApps", new Date().getTime());
				notifyMe("Owned Games List Updated!");
			},
			error: function(e){
				// Don't check for atleast another 30 minutes - Steam may be down
				var checkNext = Number(localStorage.getItem("updatedOwnedApps"))+(1800*1000);
				localStorage.setItem("updatedOwnedApps", checkNext);
			}
		});
	}
	// Set owned apps variable
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

// Push to hidden apps
function markAsOwned(e){
	var appImg = $(e).parent().find('img').attr("alt");
	// if not string or less than 1 char long then do nothing (avoid nulls)
	if (typeof appImg !== "string" || appImg.length < 1){
		return;
	}
	hiddenApps.push(appImg);
	localStorage.setItem("hiddenApps",JSON.stringify(hiddenApps.sort()));
  let DLStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(hiddenApps,null,2));
  $('#backupHiddenApps').attr("href", DLStr).attr("download", "IGH HiddenApps_Backup.json");
	$('#IGH_HiddenGames #hiddengame_list').html("");
	hiddenApps.forEach(function(v,i){
		$('#IGH_HiddenGames #hiddengame_list').append('<div class="input-group"><span class="input-group-addon name">'+v+'</span><span class="input-group-addon remove"><i class="fa fa-times IGH_UnHide" style="color:white;"></i></span></div>');
	});
}

// Save settings when checkbox changed
function saveCheckboxOption(){
		localStorage.setItem(this.dataset.option, this.checked);
};
function saveTextareaOption(){
		localStorage.setItem(this.dataset.option, this.value);
}

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
$('#IGH_Options textarea').on('input', saveTextareaOption);

// Push hidden apps to IGH menu
function setHiddenApps(){
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
    let DLStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(hiddenApps,null,2));
    $('#backupHiddenApps').attr("href", DLStr).attr("download", "IGH HiddenApps_Backup.json");
    $('#IGH_HiddenGames #hiddengame_list').html("");
    hiddenApps.forEach(function(v,i){
      $('#IGH_HiddenGames #hiddengame_list').append('<div class="input-group"><span class="input-group-addon name">'+v+'</span><span class="input-group-addon remove"><i class="fa fa-times IGH_UnHide" style="color:white;"></i></span></div>');
    });
  }
}
setHiddenApps();

// If owned apps not set, then set as blank array
switch(localStorage.getItem("ownedApps")){
	case null:
		localStorage.setItem("ownedApps",JSON.stringify({}));
	default:
		ownedApps = JSON.parse(localStorage.getItem("ownedApps"));
}

// Check we have users steamID
steamid=false;
if(localStorage.getItem("SteamID") != null){
	$("#SteamID").val(localStorage.getItem("SteamID"));
	steamid=true;
}else{
	notifyMe('Please setup your steamID!\nClick "IndieGala Helper" up the top of the site then enter your steamID');
}

// Save SteamID on "Save Details" button click
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

// Refresh users owned games when "Refresh owned games" is clicked
$('#refreshOwned').click(function(e){
	try{
		localStorage.removeItem("updatedOwnedApps");
	}finally{
		location.reload();
	}
});

// When "X" Clicked next to "Hidden Games" remove them from the hidden games list
$(document).on("click",".remove",function(){
	var app = $(this).prev().html();
	$(this).parents(".input-group").remove();
	hiddenApps.splice(hiddenApps.indexOf(app), 1);
	localStorage.setItem("hiddenApps",JSON.stringify(hiddenApps));
  let DLStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(hiddenApps,null,2));
  $('#backupHiddenApps').attr("href", DLStr).attr("download", "IGH HiddenApps_Backup.json");
});

// When game key clicked, select the whole key and copy to clipboard
$(document).on("click","input.keys , .serial-won input",function(){
	try{
		$(this).select();
		document.execCommand('copy');
		// Check if "show steam activate window" is ticked
		switch(localStorage.getItem("showActivateWindow")){
			case "true":
			case true:
				window.location.href = "steam://open/activateproduct";
		}
	}catch(e){
		return;
	}
});

$('#importHiddenApps').on("change",function() {
  var files = document.getElementById('importHiddenApps').files;
  if (files.length <= 0) {
    return false;
  }

  var fr = new FileReader();

  fr.onload = function(e) { 
    try{
      hiddenApps = JSON.parse(e.target.result);
    }catch(e){
      console.error(e);
      alert("Something went wrong!\nPlease check you uploaded a valid .json file");
      return;
    }
    localStorage.setItem("hiddenApps",JSON.stringify(hiddenApps.sort()));
    setHiddenApps();
    document.getElementById('importHiddenApps').value = "";
  }

  fr.readAsText(files.item(0));
});