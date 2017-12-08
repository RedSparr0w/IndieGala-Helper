// Get extension current version
const version = chrome.runtime.getManifest().version;

// Create Notifications
function notifyMe(body,title='IndieGala Helper',icon='https://www.indiegala.com/img/og_image/indiegala_icon.jpg',closeOnClick=true) {//set title and icon if not included
	let notification = false;
	if (!("Notification" in window)) {//check if notifications supported
		return notification;
	}
	else if (Notification.permission === 'granted') {//check if notifications permission granted
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
			if (permission === 'granted') {//if permission granted create notification
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
} else if (localStorage.getItem('version') != version){
	localStorage.setItem('version',version);
	/* Display notification relaying update */
	let update_message = `Added new option to hide "Extra Odds" giveaways.\nBackwards page fix coming soon.`;
	if(!notifyMe(update_message + '\n- v' + version, 'IndieGala Helper Updated')){
		alert('IndieGala Helper Updated\n' + update_message + '\n- v' + version);
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
				<iframe id="IGH_iframe" src="${chrome.runtime.getURL('options.html')}" style="height:75vh;width:100%;margin-bottom:-7px;" frameBorder="0"></iframe>
			</div>
		</div>
	</div>
	`);

$('#OpenIndieGalaHelper').on('click', function(){
	$('#IGH_iframe').attr('src', '').attr('src', chrome.runtime.getURL('options.html'));
});

// Push to hidden apps
function markAsOwned(e){
	var el = $(e).parents('.tickets-col');
	var app_id = el.find('.giveaway-game-id').val();
	var app_name = el.find('img').attr('alt');
	// if not a string OR less than 1 char long then do nothing (avoid nulls)
	if (typeof app_id !== "string" || app_id.length < 1){
		return;
	}
	$('input[value="' + app_id + '"]').parents('.tickets-col').remove();
	local_settings.blacklist_apps[app_id] = app_name;
	chrome.storage.local.set(local_settings);
}

// When game key clicked, select the whole key and copy to clipboard
$(document).on('click','input.keys , .serial-won input',function(){
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

// Add donate key button
setInterval(function(){
	$('.serial-won input:not(.checked)').each(function(i){
		$(this).after(`
		<div class="entry-elem align-c activate_steam_key">
			<i class="fa fa-steam" aria-hidden="true"></i>
			<div class="donate-text-view"><p>[BETA] Redeem key on Steam!</p></div>
		</div>
		<div class="entry-elem align-c donate_indiegala_helper">
			<i class="fa fa-coffee" aria-hidden="true"></i>
			<div class="donate-text-view"><p>Donate to IndieGala Helper!</p></div>
		</div>
		`);
		$(this).addClass('checked');
	});
	$('input.keys:not(.checked)').each(function(i){
		$(this).after(`
		<div class="entry-elem align-c donate_indiegala_helper">
			<i class="fa fa-coffee" aria-hidden="true"></i>
			<div class="donate-text-view"><p>Donate to IndieGala Helper!</p></div>
		</div>
		`);
		$(this).prev().append('<div class="donate-text-view"><p>[BETA] Redeem key on Steam!</p></div>').addClass('activate_steam_key');
		$(this).addClass('checked');
	});
}, 500);

// Send key to redsparr0w on donate key click
$(document).on('click','.donate_indiegala_helper',function(){
	let data = {};
	let el = !!$(this).parents('.game-key-string').length ? $(this).parents('.game-key-string') : $(this).parents('li');
	data.product = !!$('.game-steam-url', el).length ? $('.game-steam-url', el).text() : $('.entry-elem[title]', el).attr('title');
	data.product_key = $('input', el).val();
	data.user = settings.steam_id;
	$.post('https://indiegala.redsparr0w.com/donate',data,function(result, success){
		if(success == 'success')
			el.remove();

		notifyMe(result.msg) || alert(result.msg);
	});
});

// Activate key on steam
$(document).on('click','.activate_steam_key',function(){
	let data = {};
	let el = !!$(this).parents('.game-key-string').length ? $(this).parents('.game-key-string') : $(this).parents('li');
	data.product_key = $('input', el).val();
	if(!local_settings.steam_sessionid){
		notifyMe('You must be signed into the steam website to use this feature.');
		return;
	}
	data.sessionid = local_settings.steam_sessionid;
	$.post('https://store.steampowered.com/account/ajaxregisterkey/', data, function(result, success){
		if(success == 'success' && typeof result == 'object'){
			notifyMe(activateResultMessage(result.hasOwnProperty("purchase_result_details") ? result.purchase_result_details : 4));
		} else {
      chrome.storage.local.set({steam_sessionid:false});
			notifyMe('You must be signed into the steam website to use this feature.');
		}
	});
});



function get_user_level(){
	$.ajax({
		dataType:'json',
		url:'https://www.indiegala.com/giveaways/get_user_level_and_coins',
		success: function(res){
			if (!res){
				return;
			}
			if (Number(res.current_level) >= 0){
				settings.current_level = res.current_level;
				chrome.storage.sync.set(settings);
			}
		}
	});
}

function activateResultMessage(result = 4){
	let message = '';
	switch (result){
		case 0:
			message = 'Your product activation code has successfully been activated.';
			break;
		case 14:
			message = 'The product code you\'ve entered is not valid. Please double check to see if you\'ve mistyped your key. I, L, and 1 can look alike, as can V and Y, and 0 and O.';
			break;
		case 15:
			message = 'The product code you\'ve entered has already been activated by a different Steam account. This code cannot be used again. Please contact the retailer or online seller where the code was purchased for assistance.';
			break;
		case 53:
			message = 'There have been too many recent activation attempts from this account or Internet address. Please wait and try your product code again later.';
			break;
		case 13:
			message = 'Sorry, but this product is not available for purchase in this country. Your product key has not been redeemed.';
			break;
		case 9:
			message = 'This Steam account already owns the product(s) contained in this offer. To access them, visit your library in the Steam client.';
			break;
		case 24:
			message = 'The product code you\'ve entered requires ownership of another product before activation.\n\nIf you are trying to activate an expansion pack or downloadable content, please first activate the original game, then activate this additional content.';
			break;
		case 36:
			message = 'The product code you have entered requires that you first play this game on the PlayStation®3 system before it can be registered.\n\nPlease:\n\n- Start this game on your PlayStation®3 system\n\n- Link your Steam account to your PlayStation®3 Network account\n\n- Connect to Steam while playing this game on the PlayStation®3 system\n\n- Register this product code through Steam.';
			break;
		case 50: // User entered wallet code
			message = 'The code you have entered is from a Steam Gift Card or Steam Wallet Code.  Click <a href="https://store.steampowered.com/account/redeemwalletcode">here</a> to redeem it.';
			break;
		case 4:
		default:
			message = 'An unexpected error has occurred.  Your product code has not been redeemed.  Please wait 30 minutes and try redeeming the code again.  If the problem persists, please contact <a href="https://help.steampowered.com/en/wizard/HelpWithCDKey">Steam Support</a> for further assistance.';
	}
	return message;
}

// Supress confirm message when getting key
if (!!settings.suppress_confirm_show_key_dialog){
	let el = document.createElement('script');
	el.innerHTML = `
		$("[id*=fetchlink]").on('click', function(){
			var realConfirm=window.confirm;
			window.confirm=function(){
				window.confirm=realConfirm;
				return true;
			};
		});`;
	document.head.appendChild(el);
}
