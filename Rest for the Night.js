let toChat = (content) => {
    let chatData = {
        user: game.user.id,
        content,
        speaker: ChatMessage.getSpeaker(),
    };
    ChatMessage.create(chatData, {});
};

//this function feels like it shouldn't be necessary, but I don't see a cleaner way to do it.
let getSlotLevel = (spellcastingEntry,level) => {
     switch (level) {
        case 1:
            return spellcastingEntry.data.slots.slot1;
        case 2:
            return spellcastingEntry.data.slots.slot2;
        case 3:
            return spellcastingEntry.data.slots.slot3;
        case 4:
            return spellcastingEntry.data.slots.slot4;
        case 5:
            return spellcastingEntry.data.slots.slot5;
        case 6:
            return spellcastingEntry.data.slots.slot6;
        case 7:
            return spellcastingEntry.data.slots.slot7;
        case 8:
            return spellcastingEntry.data.slots.slot8;
        case 9:
            return spellcastingEntry.data.slots.slot9;
        case 10:
            return spellcastingEntry.data.slots.slot10;
        default:
            return undefined;
    } 
};

let applyChanges = false;
new Dialog({
  title: `Rest`,
  content: `
    <div>Rest for the night?</div>
    `,
  buttons: {
    yes: {
      icon: "<i class='fas fa-check'></i>",
      label: `Rest`,
      callback: () => applyChanges = true
    },
    no: {
      icon: "<i class='fas fa-times'></i>",
      label: `Cancel`
    },
  },
  default: "yes",
  close: html => {
    if (applyChanges) {
        for ( let token of canvas.tokens.controlled ) {
            console.log(token);
            const {name} = token;
            var currentSlot=0;
            var stop = false;
            const {sp, hp} = token.actor.data.data.attributes;
            const {abilities} = token.actor.data.data;
            const {level, keyability} = token.actor.data.data.details;
            var frBonus = 1;
            const FastRecovery = token.actor.data.items.find(({name}) => name === "Fast Recovery");
            if (FastRecovery) { frBonus = 2 }
            var dmBonus = level.value;
            var dmDoom = 1;
            const DreamMay = token.actor.data.items.find(({name}) => name === "Dream May");
            if (DreamMay) { dmBonus = dmBonus*2; dmDoom = 2; }
            const hpRestored = (Math.max(abilities.con.mod,1)*dmBonus)*frBonus;
            const spellcastingEntries = token.actor.data.items.filter(i => i.type === "spellcastingEntry" && i.name !== "Scrolls");
            
            //TODO: decrement Drained by 1, remove Drained 0, remove Fatigued
            
            for(const entry of spellcastingEntries)
            {
                console.log(entry);
                switch (entry.data.prepared.value) {
                    case 'prepared':
                        for(let slotLevel = 1; slotLevel <= 10;slotLevel++)
                            {
                                currentSlot = 0;
                                stop = false;
                                while (stop == false)
                                {
                                    if (typeof getSlotLevel(entry,slotLevel).prepared[currentSlot] === 'undefined' )
                                    {
                                       stop = true;
                                    }
                                    else
                                    {
                                        getSlotLevel(entry,slotLevel).prepared[currentSlot].expended = false;
                                        currentSlot++;
                                    }
                                }
                            }
                        break;
                    case 'spontaneous':
                        for(let slotLevel = 1; slotLevel <= 10;slotLevel++)
                        {
                            getSlotLevel(entry,slotLevel).value = getSlotLevel(entry,slotLevel).max;
                        }
                        break;
                    case '': //focus spells
                        entry.data.focus.points = entry.data.focus.pool;
                        break;
                }
            }
            //token.actor.update({'':0});
            toChat(`${name} goes to bed. ${hpRestored} HP restored. All spell slots recovered. Resolve points refreshed. Doomed Status updated.`);
            token.actor.update({
                'data.attributes.hp.value': Math.clamped(0, hp.value+hpRestored, hp.max),
                'data.attributes.sp.value': sp.max,
                'data.attributes.resolve.value': abilities[keyability.value].mod,
                'data.attributes.doomed.value': Math.max(token.actor.data.data.attributes.doomed.value - dmDoom, 0)
            });
        }
      }
    }
}).render(true);
