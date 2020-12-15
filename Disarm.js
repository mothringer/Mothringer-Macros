if (!token) return ui.notifications.error(`You must select yourself.`);
if (game.user.targets.size === 0) return ui.notifications.error(`You must target at least one actor.`);
const action = {
    name: "Disarm",
    skill: "Athletics",
    targetDC: "Reflex",
    requirements:
        "You have at least one hand free. The target can’t be more than one size larger than you.",
    description:
        "You try to knock something out of an opponent’s grasp. Attempt an Athletics check against the opponent’s Reflex DC.",
    degreesOfSuccess: {
        criticalSuccess:
            "You knock the item out of the opponent’s grasp. It falls to the ground in the opponent’s space.",
        success:
            "You weaken your opponent’s grasp on the item. Until the start of that creature’s turn, attempts to Disarm the opponent of that item gain a +2 circumstance bonus, and the target takes a –2 circumstance penalty to attacks with the item or other checks requiring a firm grasp on the item.",
        criticalFailure:
            "You lose your balance and become flat-footed until the start of your next turn.",
    }, // criticalSuccess, success, failure, criticalFailure - leave step absent for no effect
    maxSize: 1, // maximum steps up in size that the target can be
    multipleAttackPenalty: true, // absent (false), true, or "agile"
};
(async () => {
    const skillRoll = () => {
        const skillKey = Object.keys(actor.data.data.skills).find(
            (key) =>
                actor.data.data.skills[key].name === action.skill.toLowerCase()
        );
        const options = actor.getRollOptions([
            "all",
            "skill-check",
            action.skill.toLowerCase(),
        ]);
        actor.data.data.skills[skillKey].roll(event, options, (roll) => {
            let resultMessage = `<hr /><h3>${action.name}</h3>`;
            let validTarget = false;
            const sizeArray = Object.keys(CONFIG.PF2E.actorSizes);
            const characterSizeIndex = sizeArray.indexOf(
                actor.data?.data?.traits?.size?.value
            );
            for (const target of game.user.targets) {
                const dc =
                    target.actor?.data?.data?.saves?.[
                        action.targetDC.toLowerCase()
                    ]?.value + 10;
                if (dc) {
                    validTarget = true;
                    resultMessage += `<hr /><b>${target.name}:</b>`;
                    const legalSize =
                        action.maxSize >=
                        sizeArray.indexOf(
                            target.actor?.data?.data?.traits?.size?.value
                        ) -
                            characterSizeIndex;
                    if (legalSize) {
                        let successStep =
                            roll.total >= dc
                                ? roll.total >= dc + 10
                                    ? 3
                                    : 2
                                : roll.total > dc - 10
                                ? 1
                                : 0;
                        switch (roll.terms[0].results[0].result) {
                            case 20:
                                successStep++;
                                break;
                            case 1:
                                successStep--;
                                break;
                        }
                        if (successStep >= 3) {
                            resultMessage += `<br />💥 <b>Critical Success</b>`;
                            if (action.degreesOfSuccess?.criticalSuccess) {
                                resultMessage += `<br />${action.degreesOfSuccess.criticalSuccess}`;
                            }
                        } else if (successStep === 2) {
                            resultMessage += `<br />✔️ <b>Success</b>`;
                            if (action.degreesOfSuccess?.success) {
                                resultMessage += `<br />${action.degreesOfSuccess.success}`;
                            }
                        } else if (successStep === 1) {
                            resultMessage += `<br />❌ <b>Failure</b>`;
                            if (action.degreesOfSuccess?.failure) {
                                resultMessage += `<br />${action.degreesOfSuccess.failure}`;
                            }
                        } else if (successStep <= 0) {
                            resultMessage += `<br />💔 <b>Critical Failure</b>`;
                            if (action.degreesOfSuccess?.criticalFailure) {
                                resultMessage += `<br />${action.degreesOfSuccess.criticalFailure}`;
                            }
                        }
                    } else {
                        resultMessage += `<br />⚠️ <b>The target is too big!</b>`;
                    }
                }
            }
            if (validTarget) {
                ChatMessage.create({
                    user: game.user._id,
                    speaker: ChatMessage.getSpeaker(),
                    content: resultMessage,
                });
            }
        });
    };
    const skillRollWithMAP = async (penalty) => {
        await actor.addCustomModifier(
            action.skill.toLowerCase(),
            "Multiple Attack Penalty",
            penalty,
            "untyped"
        );
        skillRoll();
        await actor.removeCustomModifier(
            action.skill.toLowerCase(),
            "Multiple Attack Penalty"
        );
    };
    if (action.multipleAttackPenalty) {
        new Dialog({
            title: `${action.name}`,
            content: `
                ${
                    action.requirements
                        ? `<strong>Requirements</strong> ${action.requirements}<hr>`
                        : ""
                }
                ${action.description ? `${action.description}<hr>` : ""}
            `,
            buttons: {
                first: {
                    label: "1st attack",
                    callback: skillRoll,
                },
                second: {
                    label: "2nd attack",
                    callback: () => {
                        skillRollWithMAP(
                            action.multipleAttackPenalty === "agile" ? -4 : -5
                        );
                    },
                },
                third: {
                    label: "3rd attack",
                    callback: () => {
                        skillRollWithMAP(
                            action.multipleAttackPenalty === "agile" ? -8 : -10
                        );
                    },
                },
            },
            default: "first",
        }).render(true);
    } else {
        skillRoll();
    }
})();
