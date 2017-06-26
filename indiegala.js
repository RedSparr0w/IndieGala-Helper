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
	//* show options modal when notification clicked *
	$(window).load(function(){
		notifyMe("Click here to setup IndieGala Helper!").onclick = function(){
			$('#OpenIndieGalaHelper').click();
		}
	});
	//*/
} else if (localStorage.getItem("version") != version){
	localStorage.setItem("version",version);
	/* Display notification relaying update */
	if(!notifyMe('Updated options menu,\nNew options also have been added\n(All options have been reset)\n- v'+version, 'IndieGala Helper Updated')){
		alert('IndieGala Helper Updated\n' + 'Updated options menu,\nNew options also have been added\n(All options have been reset)\n- v'+version);
	}
	//*/
}

// Indiegala Helper Menu
$('#log-in-status-cont').after(`
	<li><a id="OpenIndieGalaHelper" class="libd-group-item libd-bounce libd-group-item-icon" href="#" data-toggle="modal" data-target="#indiegala-helper"> IndieGala Helper</a></li>
	<div id="indiegala-helper" class="modal fade" role="dialog">
		<div class="modal-dialog">
			<div class="modal-content">
				<i id="closeModal" class="fa fa-times" aria-hidden="true" data-dismiss="modal" style="position: absolute;right: 10px;top: 10px;font-size: 25px;color: white;cursor: pointer;"></i>
				<iframe src="${chrome.runtime.getURL('options.html')}" style="height:75vh;width:100%;margin-bottom:-7px;" frameBorder="0"></iframe>
			</div>
		</div>
	</div>
	`);

$('#closeModal').on('click', function(){
	refreshSettings();
});

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
		if( settings.show_steam_activate_window ){
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