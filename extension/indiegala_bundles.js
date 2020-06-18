// Mark owned games and get values of cards
function showOwnedApps(){
	const bundleApps = [];

	[...document.getElementsByClassName('bundle-page-tier-item-col')].forEach((el) => {
		// Check if this app has trading cards
		// if (/no\s*trading\s*cards/i.test($('.bundle-page-tier-item-trading', this).eq(0).text())) continue;

		let app_id = 0;
		try {
			app_id = +el.getElementsByTagName('img')[0].src.match(/\/(\d+)\.jpg/)[1];
		}catch(ಠ_ಠ){
			return;
		}

		// Mark games as owned
		if(local_settings.owned_apps.includes(app_id)){
			el.classList.add('owned');
		}

		bundleApps.push(app_id);
	});

	// Get card values - We don't mind if this data was cached
	fetch(`https://indiegala.redsparr0w.com/steamAPI/getCardPrices?apps=${bundleApps.join(',')}`).then(res => res.json()).then(result => {
		bundleApps.forEach(app_id => {
			// Divide the total by 2 as you get half the total cards as free drops
			if (result[app_id]){
				try { document.querySelector(`[src*='${app_id}.jpg']`).closest('.bundle-page-tier-item-col').getElementsByClassName('bundle-page-tier-item-trading')[0].append(` [$${(Math.floor(result[app_id] / 2) / 100).toFixed(2)}]`); }catch(ಠ_ಠ){ /* DO NOTHING */ }
			}
		});
	}).catch((ಠ_ಠ) => { /* DO NOTHING */ });
}

// Wait until indiegala loads the initial bundle page
const wait_for_page = setInterval(() => {
	if(document.getElementsByClassName('bundle-page-tier-item-col').length){
		// Page loaded
		clearInterval(wait_for_page);
		// Show owned apps
		showOwnedApps();
		// Add donate button
		const emailEl = document.getElementById('form-email-2') || document.getElementById('form-email');
		if (emailEl) emailEl.parentElement.innerHTML += `<br/><a id="donate-button" class="bg-gradient-red" onclick="document.getElementById('${emailEl.id}').value = 'donate-bundle@redsparr0w.com';this.innerText = 'Thank you for your support! ♥'">Donate a bundle to IndieGala Helper?</a>`;
	}
}, 250);
