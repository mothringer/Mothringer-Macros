(async () => {
if (canvas.tokens.controlled.length === 0)
{
	ui.notifications.warn("You must select at least one token.");
	return
}


let template =
	`

<form>
	<p>Updating lighting and vision for <span style="color: darkred">${canvas.tokens.controlled.length}</span> tokens.</p>
	<p><b>Vision Type:</b></p>
	<p><input type="radio" name="vision" value="Normal"/> Normal
	<input type="radio" name="vision" value="Low-light"/> Low-light
	<input type="radio" name="vision" value="Darkvision"/> Darkvision</p>
	<p><b>Light Source:</b></p>
	<p><input type="radio" name="light" value="None"/> None
	<input type="radio" name="light" value="Torch"/> Torch/Light Spell
	<input type="radio" name="light" value="Light"/> Light Spell (Heightened)</p>
	<p><input type="checkbox" id="updateActor" style="width: 80px margin: 0 5px 0 5px" value="true" />Update actor's prototype token also</p>
</form>`;

let doUpdate = false;


function tokenUpdate(data,updateActorPrototype){
	for (let currentToken of canvas.tokens.controlled)
	{
		currentToken.update(data);
		if (updateActorPrototype)
		{
			let prototypeToken = game.actors.find(actor => actor._id === canvas.tokens.controlled[0].data.actorId).data.token;
			if (data.vision)
			{
				prototypeToken.dimSight = data.dimSight;
				prototypeToken.brightSight = data.brightSight;
				prototypeToken.vision = data.vision;
			}
			if (data.dimLight)
			{
				prototypeToken.dimLight = data.dimLight;
				prototypeToken.brightLight = data.brightLight;
			}
		}
	}
}

new Dialog({
	title: "Token Vision and Lighting",
	content: template,
	buttons: {
		yes: {
			icon: "<i class='fas fa-check'></i>",
			label: "Apply",
			callback: () => doUpdate = true
		},
		no: {
			icon: "<i class='fas fa-times'></i>",
			label: "Cancel",
		},        
	},
	default: "yes",
	close: html => {
		let updateActorPrototype = html.find("#updateActor")[0].checked;
		for (const vision of document.getElementsByName("vision")) {
			if (vision.checked) var visionType = vision.value;
		}
		for (const light of document.getElementsByName("light")) {
			if (light.checked) var lightType = light.value;
		}
		let update = {};
		switch (visionType) {
			case "Normal":
				update = {dimSight: 0, brightSight:0, vision:true,};
				break;
			case "Low-light":
				update = {dimSight: 1000, brightSight:0, vision:true,};
				break;
			case "Darkvision":
				update = {dimSight: 0, brightSight:1000, vision:true,};
				break;
		}
		switch (lightType) {
			case "None":
				update.dimLight = 0;
				update.brightLight = 0;
				break;
			case "Torch":
				update.dimLight = 40;
				update.brightLight = 20;
				break;
			case "Light":
				update.dimLight = 120;
				update.brightLight = 60;
				break;
		}
		if (doUpdate) tokenUpdate(update,updateActorPrototype);
	}
}, {
	id: 'pf2-template-creator'
}).render(true);
})();
