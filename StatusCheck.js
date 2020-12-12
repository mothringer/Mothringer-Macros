console.log(args[0] + args[1])
if (args[2] == "delete" && args[3] == false) {

    removeCondition(args[0], args[1])

}

if (args[3] == true) {

    const roll = new Roll(args[4]).roll();
    let myToken = canvas.tokens.placeables.find(token => token.id === args[1]);

    myToken.actor.update({ 'data.attributes.hp.value': myToken.actor.data.data.attributes.hp.value - roll.total })


    roll.toMessage({
        rollMode: "public"
    });
}

function removeCondition(type, target) {


    let myToken = canvas.tokens.placeables.find(token => token.id === target);
    let delCondition = myToken.actor.data.items.find(i => i.name === type);
console.log(delCondition)
    if (type === "Frightened" && delCondition.data.value.value > 1) {
        PF2eConditionManager.updateConditionValue(delCondition._id, myToken, delCondition.data.value.value - 1)
    } else {

        let promise = new Promise(function (resolve, reject) {
            // the function is executed automatically when the promise is constructed
            // after 1 second signal that the job is done with the result "done"
            setTimeout(() => resolve(PF2eConditionManager.removeConditionFromToken(delCondition._id, myToken)), 100);
        })




    }

}
