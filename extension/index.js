// When extension icon is clicked open specific page
chrome.browserAction.onClicked.addListener(() => {
	chrome.tabs.create({'url': 'https://www.indiegala.com/profile'});
});

chrome.runtime.onMessage.addListener((data, sender, callback) => {
	if (data.type == 'notification'){
		chrome.notifications.getPermissionLevel((level) => {
			if (level == 'denied'){
				callback(false);
			} else {
				chrome.notifications.create('', data.options);
				callback(true);
			}
		});
		return true;
	}
	if (data.type == 'open-options-page'){
		chrome.runtime.openOptionsPage();
	}
	if (data.type == 'activate-steam-key'){
		try {
			// Try to activate the key with steam
			var form_data = new FormData();
			form_data.append('product_key', data.product_key);
			form_data.append('sessionid', data.sessionid);

			fetch('https://store.steampowered.com/account/ajaxregisterkey/', {method : "POST", body: form_data}).then(res => res.json()).then(result => {
				const response = steam_activation_response[result.purchase_result_details] || 'An unexpected error has occurred, Your product code has not been redeemed, Please wait 30 minutes before trying redeeming the code again.';
				callback(response);
			}).catch(()=>{callback()});
		} catch (e) {
			callback();
		}
		return true;
	}
});

const steam_activation_response = {
	...{
		0: 'NoDetail',
		1: 'AVSFailure',
		2: 'InsufficientFunds',
		3: 'ContactSupport',
		4: 'Timeout',
		5: 'InvalidPackage',
		6: 'InvalidPaymentMethod',
		7: 'InvalidData',
		8: 'OthersInProgress',
		9: 'AlreadyPurchased',
		10: 'WrongPrice',
		11: 'FraudCheckFailed',
		12: 'CancelledByUser',
		13: 'RestrictedCountry',
		14: 'BadActivationCode',
		15: 'DuplicateActivationCode',
		16: 'UseOtherPaymentMethod',
		17: 'UseOtherFunctionSource',
		18: 'InvalidShippingAddress',
		19: 'RegionNotSupported',
		20: 'AcctIsBlocked',
		21: 'AcctNotVerified',
		22: 'InvalidAccount',
		23: 'StoreBillingCountryMismatch',
		24: 'DoesNotOwnRequiredApp',
		25: 'CanceledByNewTransaction',
		26: 'ForceCanceledPending',
		27: 'FailCurrencyTransProvider',
		28: 'FailedCyberCafe',
		29: 'NeedsPreApproval',
		30: 'PreApprovalDenied',
		31: 'WalletCurrencyMismatch',
		32: 'EmailNotValidated',
		33: 'ExpiredCard',
		34: 'TransactionExpired',
		35: 'WouldExceedMaxWallet',
		36: 'MustLoginPS3AppForPurchase',
		37: 'CannotShipToPOBox',
		38: 'InsufficientInventory',
		39: 'CannotGiftShippedGoods',
		40: 'CannotShipInternationally',
		41: 'BillingAgreementCancelled',
		42: 'InvalidCoupon',
		43: 'ExpiredCoupon',
		44: 'AccountLocked',
		45: 'OtherAbortableInProgress',
		46: 'ExceededSteamLimit',
		47: 'OverlappingPackagesInCart',
		48: 'NoWallet',
		49: 'NoCachedPaymentMethod',
		50: 'CannotRedeemCodeFromClient',
		51: 'PurchaseAmountNoSupportedByProvider',
		52: 'OverlappingPackagesInPendingTransaction',
		53: 'RateLimited',
		54: 'OwnsExcludedApp',
		55: 'CreditCardBinMismatchesType',
		56: 'CartValueTooHigh',
		57: 'BillingAgreementAlreadyExists',
		58: 'POSACodeNotActivated',
		59: 'CannotShipToCountry',
		60: 'HungTransactionCancelled',
		61: 'PaypalInternalError',
		62: 'UnknownGlobalCollectError',
		63: 'InvalidTaxAddress',
		64: 'PhysicalProductLimitExceeded',
		65: 'PurchaseCannotBeReplayed',
		66: 'DelayedCompletion',
		67: 'BundleTypeCannotBeGifted',
	}, ...{
		0: 'Your product activation code has successfully been activated.',
		9: 'This Steam account already owns the product(s) contained in this offer. To access them, visit your library in the Steam client.',
		13: 'Sorry, but this product is not available for purchase in this country. Your product key has not been redeemed.',
		14: 'The product code you\'ve entered is not valid. Please double check to see if you\'ve mistyped your key. I, L, and 1 can look alike, as can V and Y, and 0 and O.',
		15: 'The product code you\'ve entered has already been activated by a different Steam account. This code cannot be used again. Please contact the retailer or online seller where the code was purchased for assistance.',
		24: 'The product code you\'ve entered requires ownership of another product before activation.\n\nIf you are trying to activate an expansion pack or downloadable content, please first activate the original game, then activate this additional content.',
		36: 'The product code you have entered requires that you first play this game on the PlayStation®3 system before it can be registered.\n\nPlease:\n\n- Start this game on your PlayStation®3 system\n\n- Link your Steam account to your PlayStation®3 Network account\n\n- Connect to Steam while playing this game on the PlayStation®3 system\n\n- Register this product code through Steam.',
		50: 'The code you have entered is from a Steam Gift Card or Steam Wallet Code.  Click <a href="https://store.steampowered.com/account/redeemwalletcode">here</a> to redeem it.',
		53: 'There have been too many recent activation attempts from this account or Internet address. Please wait and try your product code again later.',
	}
};
