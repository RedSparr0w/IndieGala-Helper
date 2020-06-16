// Get extension current version
const version = chrome.runtime.getManifest().version;

// Create Notifications
function notifyMe(message, title='IndieGala Helper', iconUrl='https://www.indiegala.com/img/og_image/indiegala_icon.jpg', closeOnClick=true){//set title and icon if not included
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage({
			type: 'notification',
			options: {
				title,
				message,
				iconUrl,
				type: 'basic'
			}
		}, (success) => {
			if (success) resolve(true);
			else reject('permission denied');
		});
	});
}

// If version not set, assume new user, else assume updated
if (localStorage.getItem('version')===null){
	localStorage.setItem('version', version);
} else if (localStorage.getItem('version') != version){
	localStorage.setItem('version', version);
	// TO DELETE - old update message that cannot be uploaded yet.
	const old_update_message_1 = 'Updated to work with new giveaways page layout,\nInfinite scrolling, Silver counter, Hiding apps and Blacklist should be working again.';
	notifyMe(old_update_message_1, '[v5.0.4] IndieGala Helper Updated').catch(() => {
		alert(`[v${version}] IndieGala Helper Updated\n${old_update_message_1}`);
	});
	// TO DELETE - old update message that cannot be uploaded yet.
	const old_update_message_2 = 'Updated where owned games list is retrieved from, should now work a lot better.\nMust be signed into steam for better list.';
	notifyMe(old_update_message_2, '[v5.0.5] IndieGala Helper Updated').catch(() => {
		alert(`[v${version}] IndieGala Helper Updated\n${old_update_message_2}`);
	});
	// Display notification relaying update info
	const update_message = 'Re-added support for bundles pages.\nShows owned apps, possible trading card value (USD)';
	notifyMe(update_message, `[v${version}] IndieGala Helper Updated`).catch(() => {
		alert(`[v${version}] IndieGala Helper Updated\n${update_message}`);
	});
}

function getUserLevel(){ // eslint-disable-line no-unused-vars
	$.ajax({
		dataType:'json',
		url: 'https://www.indiegala.com/get_user_info',
		data: {
			'uniq_param': new Date().getTime(),
			'show_coins': 'True'
		},
		success: function(res){
			if (!res){
				return;
			}
			if (Number(res.giveaways_user_lever) >= 0){
				settings.current_level = +res.giveaways_user_lever;
				chrome.storage.sync.set(settings);
			}
		}
	});
}

// Indiegala Helper Menu
$('#main-menu-user').after('<li class="main-menu-link"><a id="OpenIndieGalaHelper" href="#" data-toggle="modal" data-target="#indiegala-helper">IG HELPER</a></li>');
// $('#OpenIndieGalaHelper').on('click', () => {
// 	chrome.runtime.sendMessage({type:'open-options-page'});
// });
$('body').append(`
	<div id="indiegala-helper" class="modal fade" role="dialog">
		<div class="modal-dialog">
			<div class="modal-content">
				<i id="closeModal" class="fa fa-times" aria-hidden="true" data-dismiss="modal" style="position: absolute;right: 10px;top: 10px;font-size: 25px;color: white;cursor: pointer;"></i>
				<iframe id="IGH_iframe" src="${chrome.runtime.getURL('options.html')}" style="height:75vh;width:100%;margin-bottom:-7px;" frameBorder="0"></iframe>
			</div>
		</div>
	</div>`);

// Push to hidden apps
function addToBlacklist(app_id = 0, app_name = ''){ // eslint-disable-line no-unused-vars
	// If name or ID too short return
	if (app_name.length < 1 || app_id < 1){
		return;
	}
	$(`[data-img-src*='/${app_id}/']`).parents('.items-list-col').remove();
	local_settings.blacklist_apps[app_id] = app_name;
	chrome.storage.local.set(local_settings);
}

/* TODO: Fix these functions

// Add donate key button
setInterval(() => {
	$('.serial-won input:not(.checked)').each(function(){
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
	$('input.keys:not(.checked)').each(function(){
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
$(document).on('click', '.donate_indiegala_helper', function(){
	let data = {};
	let el = !!$(this).parents('.game-key-string').length ? $(this).parents('.game-key-string') : $(this).parents('li');
	data.product = !!$('.game-steam-url', el).length ? $('.game-steam-url', el).text() : $('.entry-elem[title]', el).attr('title');
	data.product_key = $('input', el).val();
	data.user = settings.steam_id;
	$.post('https://indiegala.redsparr0w.com/donate', data, (result, success) => {
		if(success == 'success')
			el.remove();

		notifyMe(result.msg).catch(() => { alert(result.msg); });
	});
});

// Activate key on steam
$(document).on('click','.activate_steam_key',function(){
	let data = {};
	let el = !!$(this).parents('.game-key-string').length ? $(this).parents('.game-key-string') : $(this).parents('li');
	data.product_key = $('input', el).val();
	$.post('https://store.steampowered.com/account/ajaxregisterkey/', data, (result, success) => {
		if(success == 'success' && typeof result == 'object' && result.success <= 2){
			notifyMe(activateResultMessage(result.hasOwnProperty('purchase_result_details') ? result.purchase_result_details : 4));
		} else {
			window.open(`https://store.steampowered.com/account/registerkey?key=${data.product_key}`);
		}
	});
});

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
			message = 'An unexpected error has occurred, Your product code has not been redeemed, Please wait 30 minutes before trying redeeming the code again.';
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
/TODO */
