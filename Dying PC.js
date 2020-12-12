(async () => {
if (!token) {
ui.notifications.warn("You must select yourself.");
return
}

if(!game.combats.active) return ui.notifications.error(`No active combat.`);

let template =
	`

<form>
	<p>Token: <span style="color: darkred">${token.name}</span></p>
	<p><input type="checkbox" id="recover" style="width: 80px margin: 0 5px 0 5px" value="true" />Recovery check success?</p>
	<p><input type="checkbox" id="critical" style="width: 80px margin: 0 5px 0 5px" value="true" />Critical?</p>
	<p><input type="checkbox" id="rollChecks" style="width: 80px margin: 0 5px 0 5px" value="true" />Add automatic recovery check TurnAlert?</p>
	<p><input type="checkbox" id="removeWounded" style="width: 80px margin: 0 5px 0 5px" value="true" />Remove wounded condition?</p>
</form>`;

let mustRoll = false;
let clearFX = false;
new Dialog({
	title: "Dying",
	content: template,
	buttons: {
		yes: {
			icon: "<i class='fas fa-check'></i>",
			label: "Apply",
			callback: () => mustRoll = true
		},
		no: {
			icon: "<i class='fas fa-times'></i>",
			label: "Cancel",
		},        
	},
	default: "yes",
	close: html => {
		if (mustRoll) {
			(async () => {
				if (html.find("#removeWounded")[0].checked)
				{
					await PF2eConditionManager.removeConditionFromToken(token.actor.data.items.find((x) => x.name == "Wounded")._id, token);
					await addWD("wounded", 0);
					return;
				}
				const recover = html.find("#recover")[0].checked;
				var woundValue = token.actor.data.data.attributes.wounded.value;
				var dyingValue = token.actor.data.data.attributes.dying.value;
				if (recover && dyingValue == 0)
				{
					ui.notifications.warn("You are not dying.");
					return;
				}
				let cValue = 1;
				let critical = html.find("#critical")[0].checked;
				let rollChecks = html.find("#rollChecks")[0].checked;
				if (critical)
					cValue++;
				if (dyingValue == 0)
					cValue = cValue + woundValue;
				let condition = await PF2eConditionManager.getCondition("Dying");
				if (dyingValue == 0)
				{
					woundValue++;
					await PF2eConditionManager.addConditionToToken(condition, token);
					await PF2eConditionManager.updateConditionValue(token.actor.data.items.find((x) => x.name == "Dying")._id, token, cValue)
					await updateHUD("Dying");
				}
				else if (!recover)
				{
					await PF2eConditionManager.updateConditionValue(token.actor.data.items.find((x) => x.name == "Dying")._id, token, dyingValue + cValue)
					await updateHUD("Dying");
				}
				if (recover && cValue >= dyingValue)
					await PF2eConditionManager.removeConditionFromToken(token.actor.data.items.find((x) => x.name == "Dying")._id, token);
				else if (recover)
				{
					await PF2eConditionManager.updateConditionValue(token.actor.data.items.find((x) => x.name == "Dying")._id, token, dyingValue - cValue)
					await updateHUD("Dying");
				}
				
				if (woundValue == 1 && dyingValue == 0)
				{
					condition = await PF2eConditionManager.getCondition("Wounded");
					await PF2eConditionManager.addConditionToToken(condition, token);
				}
				else if (dyingValue == 0)
				{
					await PF2eConditionManager.updateConditionValue(token.actor.data.items.find((x) => x.name == "Wounded")._id, token, woundValue)
				}
				await updateHUD("Wounded");
				if (!(recover && cValue >= dyingValue))
				{
					await updateHUD("Unconscious");
					await updateHUD("Blinded");
				}
				await updateHUD("Prone");
				await updateHUD("Flat-Footed");

				await PF2eStatusEffects._createChatMessage(token)
				if (!recover)
					cValue += dyingValue;
				else
					cValue = Math.max(dyingValue - cValue,0);
					
				await addWD("dying",cValue);
				await addWD("wounded", woundValue);
				if (dyingValue == 0 && !recover)
					await changeInit();
				if (rollChecks)
				{
					const alertData = {
						combatId: game.combat.data._id,
						name: "Recovery Check",
						createdRound: game.combat.data.round,
						turnId: game.combat.getCombatantByToken(token.data._id)._id,
						round: 1,
						macro: "RecoveryCheck",
						repeating: {frequency: 1, expire: 0, expireAbsolute: false},
						roundAbsolute: false,
						userId: game.userId,
						endOfTurn: false,
					}
					TurnAlert.create(alertData);
				}
				if (cValue == 0)
				{
					let alert = TurnAlert.getAlertByName("Recovery Check",game.combat.data._id);
					if (alert)
						TurnAlert.delete(game.combat.data._id,alert.id);
				}
			})();
		}
		if (clearFX) {
			deathFX("remove")
		}
	}
	
}, {
	id: 'pf2-template-creator'
}).render(true);

function updateHUD(type) {
	let updates = [];
	let item = token.actor.items.find(i => i.name === type);
	console.log("item: "+item)
	updates.push({ "_id": item._id, "data.sources.hud": true });
	actor.updateEmbeddedEntity("OwnedItem", updates);
}

function addWD(type,cValue) {
	console.log(cValue)
	if(cValue >= 0 && cValue <= 4) {
		if (type == "dying")
			actor.update({"data.attributes.dying.value":cValue})
		else
			actor.update({"data.attributes.wounded.value":cValue})
	}
}

function changeInit() {
	//change initiative
	let update = duplicate(game.combats.active);
	let currentTokenID = game.combats.active.current.tokenId
	let currentInit = game.combats.active.data.combatants.find(c => c.tokenId === currentTokenID).initiative
	let combatant = update.combatants.find(i=>i.tokenId===token.id)
	combatant.initiative = parseInt(currentInit)+0.6;
	game.combats.active.update(update);
}


			})();
