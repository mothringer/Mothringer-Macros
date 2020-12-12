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
      <input type="hidden" id="critical" value="false"/>
    <p>Critical Hit? <input type="checkbox" id="critical" style="width: 80px" value="true" /></p>
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
				debugger;
				var woundValue = canvas.tokens.controlled[0].actor.data.data.attributes.wounded.value;
                let cValue = 1;
				let critical = html.find("#critical")[0].value;
                if (critical == "true")
					cValue = 2;
				cValue = cValue + woundValue;
				woundValue++;
                let condition = await PF2eConditionManager.getCondition("Dying");
                await PF2eConditionManager.addConditionToToken(condition, token);
                await updateHUD("Dying");
				if (woundValue == 1)
				{
					condition = await PF2eConditionManager.getCondition("Wounded");
					await PF2eConditionManager.addConditionToToken(condition, token);
				}
				else
				{
					await PF2eConditionManager.updateConditionValue(token.actor.data.items.find((x) => x.name == "Wounded")._id, token, woundValue)
				}
                await updateHUD("Wounded");
				await updateHUD("Unconscious");
				await updateHUD("Prone");
				await updateHUD("Blinded");
				await updateHUD("Flat-Footed");
                
                await PF2eStatusEffects._createChatMessage(token)
                await addWD("dying",cValue);
                await addWD("wounded", woundValue);
                await changeInit();
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
    if(cValue > 0 && cValue <= 4) {
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
