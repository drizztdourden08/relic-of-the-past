/* @layer renderer-app @kind config */
import type { ScreenMeta, Section } from '@drizztdourden08/brock-react';

const meta: ScreenMeta = { title: 'Gameplay', icon: 'gamepad-2', order: 1, keywords: ['gameplay', 'auto save', 'turbo', 'dialog', 'cheats', 'vanilla safe'] };

const turboKeywords = 'turbo fast forward speed up faster skip hold multiplier speedrun grind';

const asMinutes = (seconds: number): string => (seconds >= 60 ? `${Math.floor(seconds / 60)}m` : `${seconds}s`);
const asCount = (value: number): string => String(value);
const asSeconds = (value: number): string => `${value}s`;

const sections: Section[] = [
  {
    id: 'game-flow',
    title: 'Game Flow',
    subsections: [
      {
        id: 'save-auto',
        title: 'Auto-Save',
        items: [
          { key: 'autoSaveEnabled', label: 'Enable Auto-Save', description: 'Automatically create save state snapshots at regular intervals during gameplay', hint: 'On, the game keeps a save state every few minutes while you play.', keywords: 'auto save timer interval automatic' },
          { key: 'autoSaveIntervalSeconds', label: 'Auto-Save Interval', description: 'How often to create an automatic save', hint: 'Drag to set the time between two auto-saves. Needs Enable Auto-Save.', keywords: 'auto save interval time frequency', control: { kind: 'range', min: 60, max: 1800, step: 60, format: asMinutes } },
          { key: 'autoSaveMaxEntries', label: 'Max Auto-Save Entries', description: 'Maximum number of auto-saves to keep (oldest are pruned)', hint: 'Drag to set how many auto-saves are kept. The oldest goes first.', keywords: 'auto save max limit entries prune', control: { kind: 'range', min: 1, max: 20, step: 1, format: asCount } },
          { key: 'saveOnQuit', label: 'Save on Quit', description: 'Automatically create a save state when you stop the game or close the app', hint: 'On, stopping the game or closing the app keeps a save state first.', keywords: 'save quit close exit auto' },
        ],
      },
      {
        id: 'save-shortcuts',
        title: 'Quick Save Shortcuts',
        items: [
          { key: 'enhancedSaveSlotShortcut', label: 'Enhanced Save Slot Shortcut', description: 'Opens the save slot menu on shortcut press instead of immediately saving/loading', hint: 'On, the save shortcut opens the slot menu. Off, it saves or loads at once.', keywords: 'save state slot shortcut enhanced menu overlay' },
          { key: 'saveHoldDuration', label: 'Hold to Save Duration', description: 'How long to hold the key to save (seconds)', hint: 'Drag to set how long you hold the save key before it saves. Needs the enhanced shortcut.', keywords: 'save hold duration time seconds', control: { kind: 'range', min: 1, max: 5, step: 0.5, format: asSeconds } },
        ],
      },
      {
        id: 'turbo',
        title: 'Turbo',
        items: [
          { key: 'turboEnabled', label: 'Turbo', description: 'Run the game faster than normal while the Turbo shortcut is held. Bind the shortcut under Controls. Music keeps its own tempo; everything else moves at the chosen speed.', hint: 'On, holding the Turbo shortcut speeds the game up.', keywords: turboKeywords },
          { key: 'turboSpeed', label: 'Turbo Speed', description: 'How much faster the game runs while the shortcut is held, from 1.25x up to 10x.', hint: 'Drag to set how fast Turbo runs. Needs Turbo on.', keywords: turboKeywords },
        ],
      },
    ],
  },
  {
    id: 'received-items',
    title: 'Received Items',
    items: [
      { key: 'quietRupees', label: 'Quiet Rupees', description: 'Randomizer rupees arrive without a message.', hint: 'On, rupees sent by the randomizer arrive without a message box.', keywords: 'quiet rupees message received randomizer archipelago online hold up' },
      { key: 'quietBombs', label: 'Quiet Bombs', description: 'Randomizer bombs arrive without a message.', hint: 'On, bombs sent by the randomizer arrive without a message box.', keywords: 'quiet bombs message received randomizer archipelago online hold up' },
      { key: 'quietArrows', label: 'Quiet Arrows', description: 'Randomizer arrows arrive without a message.', hint: 'On, arrows sent by the randomizer arrive without a message box.', keywords: 'quiet arrows message received randomizer archipelago online hold up' },
    ],
  },
  {
    id: 'movement',
    title: 'Movement',
    items: [
      { key: 'turnWhileDashing', label: 'Turn While Dashing', description: 'Change direction while using the Pegasus Boots dash', hint: 'On, you can steer during a Pegasus Boots dash.', keywords: 'dash turn pegasus boots direction' },
      { key: 'mirrorToDarkworld', label: 'Mirror to Dark World', description: 'The Magic Mirror can warp you to the Dark World from the Light World', hint: 'On, the Magic Mirror also works from the Light World.', keywords: 'mirror warp dark world light world' },
      { key: 'cancelBirdTravel', label: 'Cancel Bird Travel', description: 'Cancel duck flight in progress by pressing the X button', hint: 'On, X cancels a duck flight while it is in the air.', keywords: 'bird duck cancel fly' },
      { key: 'allowDiving', label: 'Allow Diving with Flippers', description: 'Press B while swimming to duck under for a moment, out of reach of anything that would hit you. Turned on automatically by the extra dungeon, whose water room needs it.', hint: 'On, B dives under the water for a moment while you swim.', keywords: 'dive diving swim underwater flippers b button dodge' },
    ],
  },
  {
    id: 'combat',
    title: 'Combat',
    items: [
      { key: 'collectItemsWithSword', label: 'Collect Items with Sword', description: 'Pick up hearts, rupees, and other items by slashing them with your sword', hint: 'On, a sword slash picks up the items it touches.', keywords: 'sword collect slash hearts items' },
      { key: 'breakPotsWithSword', label: 'Break Pots with Sword', description: 'Level 2 or higher swords can break pots by slashing them', hint: 'On, a level 2 sword or better breaks pots.', keywords: 'pots sword break level' },
      { key: 'moreActiveBombs', label: 'More Active Bombs', description: 'Place up to 4 active bombs at once instead of the original limit of 2', hint: 'On, four bombs can be down at once.', keywords: 'bombs active limit' },
    ],
  },
  {
    id: 'dialog',
    title: 'Dialog',
    subsections: [
      {
        id: 'dialog-pacing',
        title: 'Pacing',
        items: [
          { key: 'dialogSpeed', label: 'Text Speed', description: 'How fast text, pauses and scrolling play out: below Original slows typed lines, above it speeds everything, Instant skips the wait', hint: 'Drag to set how fast messages play out. Original matches the game.', keywords: 'dialog text speed fast slow instant pacing multiplier' },
          { key: 'dialogHoldToAccelerate', label: 'Hold A to Accelerate', description: 'While A is held, dialog plays at the speed on the right', hint: 'On, holding A plays messages at the speed you pick beside it.', keywords: 'dialog hold a accelerate fast forward speed button' },
          { key: 'dialogFillOnB', label: 'B Completes the Box', description: 'One press writes the whole box; the next press advances', hint: 'On, B fills the whole box at once and the next press moves on.', keywords: 'dialog b complete fill box skip typing advance' },
          { key: 'dialogTypewriter', label: 'Type Letter by Letter', description: 'Lines the game shows all at once type out one letter at a time, so Text Speed sets the typing rate', hint: 'On, every line types out one letter at a time.', keywords: 'dialog typewriter letter glyph typing rate slow text speed' },
        ],
      },
      {
        id: 'dialog-skipping',
        title: 'Skipping',
        items: [
          { key: 'autoSkipDialog', label: 'Auto-Skip Dialog', description: 'Show dialog text instantly and dismiss message boxes for you, including item-get text. Yes/no and shop prompts still wait for your answer. Not in the original game.', hint: 'On, message boxes show at once and close by themselves. Questions still wait for you.', keywords: 'dialog text skip fast auto advance message box speed instant' },
          { key: 'disableTelepathy', label: 'Disable Telepathic Messages', description: "Suppress the princess's periodic telepathic pleas while walking to the castle in the rain", hint: 'On, the calls for help on the way to the castle stay quiet.', keywords: 'princess telepathy rain message annoying skip' },
        ],
      },
    ],
  },
  {
    id: 'qol',
    title: 'Quality of Life',
    items: [
      { key: 'disableLowHealthBeep', label: 'Disable Low Heart Beep', description: 'Silence the repeating warning beep when your health is low', hint: 'On, low health no longer beeps.', keywords: 'beep heart health warning annoying' },
      { key: 'skipIntroOnKeypress', label: 'Skip Intro on Keypress', description: 'Press any key to skip the intro and title screen sequence', hint: 'On, any key skips the intro to the file select.', keywords: 'intro skip key press' },
      { key: 'showMaxItemsInYellow', label: 'Indicate Max Resources', description: "Highlight rupees, bombs, and arrows in yellow when you're carrying the maximum amount", hint: 'On, a full count of rupees, bombs or arrows turns yellow.', keywords: 'max yellow rupees bombs arrows' },
      { key: 'carryMoreRupees', label: 'Larger Wallet', description: 'Increase the maximum rupee capacity from 999 to 9999', hint: 'On, the wallet holds up to 9999 rupees.', keywords: 'rupees wallet money' },
      { key: 'prefillFileName', label: 'Prefill File Name', description: 'New files start named Link, with the cursor on End.', hint: 'On, a new file starts with a name already typed.', keywords: 'name file link new save naming end default' },
      { key: 'archeryNeedsBow', label: 'Archery Game Asks For A Bow', description: 'Stop the archery game from taking your money when you have nothing to shoot with; the owner tells you why instead. Not in the original game.', hint: 'On, the archery game refuses to charge you until you own a bow.', keywords: 'archery shooting gallery target bow arrow minigame game refund fee rupees' },
      { key: 'mapOnSelect', label: 'Open Map with Select', description: 'Press the select button to open the map without going through the pause menu. Classic controls only, since Modern gives the map a verb of its own.', hint: 'On, Select opens the map. Not used with the Modern controls.', keywords: 'map select button shortcut' },
    ],
  },
  {
    id: 'cheats',
    title: 'Cheats',
    items: [
      { key: 'cheatsEnabled', label: 'Enable Cheats', description: 'Master gate for every cheat (stats, items, combat, ignore collision). Off by default: every cheat no-ops in the C core while this is off, so leaving it off can never affect gameplay.', hint: 'On, the cheat tools work. Off, every cheat does nothing.', keywords: 'cheat cheats enable master gate ignore collision walk through walls noclip kill enemies magic' },
    ],
  },
  {
    id: 'tracker',
    title: 'Tracker',
    items: [
      { key: 'trackerEnabled', label: 'Enable Checks Tracker', description: 'The checks tracker reads inventory and save flags out of the running game. Turning it off stops that polling and the tracker stops updating.', hint: 'On, the checks tracker follows the game as you play.', keywords: 'tracker checks inventory save flags poll widget' },
    ],
  },
  {
    id: 'vanilla-safe',
    title: 'Vanilla Safe',
    items: [
      { key: 'vanillaSafe', label: 'Vanilla Safe', description: 'Forces off every feature, quality-of-life flag, bug fix, cheat, item override, custom player sprite and HUD override, so the game matches the original cartridge exactly. Harmless, low-risk divergences are included too; there are no exemptions.', hint: 'On, every change from the original game is switched off and locked.', keywords: 'vanilla safe parity original cartridge stock speedrun race lock' },
    ],
  },
];

export default sections;
export { meta };
