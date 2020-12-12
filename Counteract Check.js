/// creating counterspell levels

let optsLevels = [
  // create object data for Set DC based on counterspell level
  {level: -2, dc: 12, counterLevel: -2},
  {level: -1, dc: 13, counterLevel: -1},
  {level: 0, dc: 14, counterLevel: 0},
  {level: 1, dc: 15, counterLevel: 1, spellLevel: 1},
  {level: 2, dc: 16, counterLevel: 1},
  {level: 3, dc: 18,counterLevel: 2, spellLevel: 2},
  {level: 4, dc: 19,counterLevel: 2},
  {level: 5, dc: 20,counterLevel: 3, spellLevel: 3},
  {level: 6, dc: 22,counterLevel: 3},
  {level: 7, dc: 23,counterLevel: 4, spellLevel: 4},
  {level: 8, dc: 24,counterLevel: 4},
  {level: 9, dc: 26,counterLevel: 5, spellLevel: 5},
  {level: 10, dc: 27,counterLevel: 5},
  {level: 11, dc: 28,counterLevel: 6,spellLevel: 6},
  {level: 12, dc: 30,counterLevel: 6},
  {level: 13, dc: 31,counterLevel: 7, spellLevel: 7},
  {level: 14, dc: 32,counterLevel: 7},
  {level: 15, dc: 34,counterLevel: 8, spellLevel: 8},
  {level: 16, dc: 35,counterLevel: 8},
  {level: 17, dc: 36,counterLevel: 9,spellLevel: 9},
  {level: 18, dc: 38,counterLevel: 9},
  {level: 19, dc: 39,counterLevel: 10,spellLevel: 10},
  {level: 20, dc: 40,counterLevel: 10},
  {level: 21, dc: 42,counterLevel: 11},
  {level: 22, dc: 44,counterLevel: 11},
  {level: 23, dc: 46,counterLevel: 12},
  {level: 24, dc: 48,counterLevel: 12},
  {level: 25, dc: 50,counterLevel: 13},
];

/// code to select a token
let selectedtokens = canvas.tokens.controlled;
// new selection code as seen in Blackmarrows 
if (selectedtokens.length != 1) {
 ui.notifications.warn("You must select exactly 1 token.");
 return;
}

let pc;

for (let selectedtoken of selectedtokens) {
 if (selectedtoken.actor.data.type === "character" && pc === undefined) {
  pc = selectedtoken.actor;
 }
}
if (pc === undefined) {
 ui.notifications.warn("You must select a player token."); // Changed "target" to "select"
 return;
}

let applyChanges = false;

new Dialog({
  title: `Counteract`,
  content: `
<style>
      #pf2-template-creator header {
        border-radius: 0;
        background: linear-gradient(90deg, var(--secondary) 0%, #202b93 50%, var(--secondary) 100%);
        border: none;
        box-shadow: inset 0 0 0 1px #9f725b,inset 0 0 0 2px var(--tertiary),inset 0 0 0 3px #956d58;
        margin-bottom: 2px;
        font-size: .75rem;
      }
      #pf2-template-creator .window-content {
        border-image: url(systems/pf2e/assets/sheet/corner-box.png) 9 repeat;
      }
      #pf2-template-creator form {
        margin-bottom: 20px;

      }
      #pf2-template-creator .form-fields.buttons {
        justify-content: flex-start !important;
      }
      #pf2-template-creator .button {
        flex: 1 !important;
        border-width: 9px;
        border-image: url(systems/pf2e/assets/sheet/corner-box.png) 9 repeat;
        font-size: 12px;
        padding: 0;
        background: #171f69;
        color: #ffefbd;
        cursor: pointer;
      }
      #pf2-template-creator .button:hover {
        box-shadow: 0 0 8px white;
      }
      #pf2-template-creator .radios input[type="radio"] {
        opacity: 0;
        position: fixed;
        width: 0;
      }
      #pf2-template-creator .radios label {
        cursor: pointer;
        display: flex;
        flex: 1 !important;
        margin: -2px 0;
        background: rgba(0, 0, 0, 0.1);
        border: 2px groove #f0f0e0;
        width: 100%;
        border-radius: 3px;
        font-size: 13px;
        font-family: "Signika", sans-serif;
        justify-content: center;
        align-items: center;
        background: #171f69;
        color: #ffefbd;
        border-width: 9px;
        border-image: url(systems/pf2e/assets/sheet/corner-box.png) 9 repeat;
      }
      #pf2-template-creator .radios label i {
        margin-right: 5px;
        color: #ffefbd;
        background: #171f69;
      }
      #pf2-template-creator .radios label:hover {
        box-shadow: 0 0 8px white;
      }
      #pf2-template-creator .radios input[type="radio"]:checked + label {
        background: rgba(0, 0, 0, 0.2);
      }
      #pf2-template-creator .dialog-button {
        height: 50px;
        background: #171f69;
        color: #ffffff;
        justify-content: space-evenly;
        align-items: center;
        cursor: pointer;
      }
      #pf2-template-creator .notes {
        color: #ffefbd !important;
        flex: 0 0 100% !important;
        font-size: 12px !important;
        line-height: 16px !important;
        margin: 10px 0 5px 0 !important;
      }
      #pf2-template-creator .notes.title {
        border-bottom: 1px solid #f7d488;
        font-size: 14px !important;
        font-weight: bold;
        margin: 20px 0 10px 0 !important;
      }
    </style>
        <div>Select the spell level you are trying to counter.

        </br></br> If the effect you intend to counter is not a spell then enter the level of the effect you are attempting to counteract.<div>
        <hr/>


        <form>          
            <div class="form-group">
            <label>Modifier for Roll:</label>
            <input id="modifier" name="modifier" type="number"/>
          </div>
<hr>
          <div class="form-group">
            <label>Attacker's Spell level:</label>
            <select name="atkCounterLevel" id="atkCounterLevel">
              <option value=0></option>
              <option value=1>1st level Spell</option>
              <option value=3>2nd level Spell</option>
              <option value=5>3rd level Spell</option>
              <option value=7>4th level Spell</option>
              <option value=9>5th level Spell</option>
              <option value=11>6th level Spell</option>
              <option value=13>7th level Spell</option>
              <option value=15>8th level Spell</option>
              <option value=17>9th level Spell</option>
              <option value=19>10th level Spell</option>
            </select>
          </div>
          <div class="form-group">
            <label>Attacker's Effect Level:</label>
            <input id="atkEffectLevel" name="atkEffectLevel" type="number"/>
          </div>

<hr>
          <div> The power of what is being countered
            <div class="form-group">
            <label>Defender's DC:</label>
            <input id="defenderDC" name="defenderDC" type="number"/>
          </div> 
           <hr>
          <div class="form-group">
            <label>Defender's Spell level:</label>
           <select name="defCounterLevel" id="defCounterLevel">
              <option value=0></option>
              <option value=1>1st level Spell</option>
              <option value=3>2nd level Spell</option>
              <option value=5>3rd level Spell</option>
              <option value=7>4th level Spell</option>
              <option value=9>5th level Spell</option>
              <option value=11>6th level Spell</option>
              <option value=13>7th level Spell</option>
              <option value=15>8th level Spell</option>
              <option value=17>9th level Spell</option>
              <option value=19>10th level Spell</option>
            </select>
          </div>
          <div class="form-group">
            <label>Defender's Effect Level:</label>
            <input id="defEffectLevel" name="defEffectLevel" type="number"/>
          </div>
        </form>
<hr>
        `,
  buttons: {
   yes: {
    icon: "<i class='fas fa-check'></i>",
    label: `Counteract`,
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
    /// obtain values from input

    let atkLevel = Math.ceil((parseInt(html.find('[name="atkCounterLevel"]')[0].value) || 0) / 2);
    let atkEffectLevel = Math.ceil((parseInt(html.find('[name="atkEffectLevel"]')[0].value) || 0) / 2);
    let defLevel = Math.ceil((parseInt(html.find('[name="defCounterLevel"]')[0].value) || 0) / 2);
    let defEffectLevel = Math.ceil((parseInt(html.find('[name="defEffectLevel"]')[0].value) || 0) / 2);
    let counterModifier = parseInt(html.find('[name="modifier"]')[0].value) || 0;
    let defDC = parseInt(html.find('[name="defenderDC"]')[0].value) || 0;

    /// Calculate Counteract level
    let finalAtkCounterLevel;
    if (atkLevel > atkEffectLevel) {
     finalAtkCounterLevel = atkLevel
    } else {
     finalAtkCounterLevel = atkEffectLevel
    };



    let finalDefCounterLevel;
    if (defLevel > defEffectLevel) {
     finalDefCounterLevel = defLevel
    } else {
     finalDefCounterLevel = defEffectLevel
    };

    /// search table for DC value and compare
    let dcValue = optsLevels.find(x => x.level === defLevel).dc;
    let dcValue2 = optsLevels.find(x => x.level === defEffectLevel).dc;

    let finalDC;

    if (defDC > 0) {
     finalDC = defDC
    } else if (dcValue > dcValue2) {
     finalDC = dcValue
    } else {
    finalDC = dcValue2
};

    /// Dice rolling: Handle crits and dice rolls and create message.

    const handleCrits = (roll) => roll === 1 ? -10 : (roll === 20 ? 10 : 0);

    const roll = new Roll(`d20`).roll().total;
    const crit = handleCrits(roll)

    let message = `<b> Counteract Results</b><br> you rolled a [[${roll+counterModifier}]], `;
    let message2;

    if (roll + crit + counterModifier >= finalDC + 10) {
     message2 = (`Critical Success!<br><hr><b>Critical Success</b> Counteract the target if its counteract level is no more than 3 levels higher than your effect’s counteract level.`);
    } else if (roll + crit + counterModifier >= finalDC) {
     message2 = (`Success! <br><hr><b>Success</b> Counteract the target if its counteract level is no more than 1 level higher than your effect’s counteract level.`);
    } else if (roll + crit + counterModifier < finalDC - 10) {
     message2 = (`Critical Failure! <br><hr><b>Critical Failure</b> You fail to counteract the target.`);
    } else if (roll + crit + counterModifier < finalDC) {
     message2 = (`Failure! <br><hr><b>Failure</b> Counteract the target if its counteract level is lower than your effect’s counteract level.`);
    }

    /// Create to chat information using function bound to toChat
    let toChat = (content) => {
     let chatData = {
      user: game.user.id,
      content,
      speaker: ChatMessage.getSpeaker(),
     }
     ChatMessage.create(chatData, {})
    }

    toChat(`Attempting to counteract an effect!<br><br> <b>${token.name}</b> <br>Counteract level:<b> ${finalAtkCounterLevel}</b>.<br><br><b>Target Effect </b>(DC ${finalDC}) <br> Counteract level:<b> ${finalDefCounterLevel}.</b><br><br>${message}${message2}
`)
   }
  }
 },

 {
  id: 'pf2-template-creator'
 }).render(true);
