/* @layer renderer-app @kind config */
import type { ScreenMeta, Section } from '@drizztdourden08/brock-react';
import { withOwnRows } from '@app/settings-controls/own-row-sections';

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
          { key: 'autoSaveEnabled', label: 'Enable Auto-Save', description: 'Automatically create save state snapshots at regular intervals during gameplay', keywords: 'auto save timer interval automatic' },
          { key: 'autoSaveIntervalSeconds', label: 'Auto-Save Interval', description: 'How often to create an automatic save', hint: 'Needs Enable Auto-Save.', keywords: 'auto save interval time frequency', control: { kind: 'range', min: 60, max: 1800, step: 60, format: asMinutes } },
          { key: 'autoSaveMaxEntries', label: 'Max Auto-Save Entries', description: 'Maximum number of auto-saves to keep (oldest are pruned)', keywords: 'auto save max limit entries prune', control: { kind: 'range', min: 1, max: 20, step: 1, format: asCount } },
          { key: 'saveOnQuit', label: 'Save on Quit', description: 'Automatically create a save state when you stop the game or close the app', keywords: 'save quit close exit auto' },
        ],
      },
      {
        id: 'save-shortcuts',
        title: 'Quick Save Shortcuts',
        items: [
          { key: 'enhancedSaveSlotShortcut', label: 'Enhanced Save Slot Shortcut', description: 'Opens the save slot menu on shortcut press instead of immediately saving/loading', keywords: 'save state slot shortcut enhanced menu overlay' },
          { key: 'saveHoldDuration', label: 'Hold to Save Duration', description: 'How long to hold the key to save (seconds)', hint: 'Needs Enhanced Save Slot Shortcut.', keywords: 'save hold duration time seconds', control: { kind: 'range', min: 1, max: 5, step: 0.5, format: asSeconds } },
        ],
      },
      {
        id: 'turbo',
        title: 'Turbo',
        items: [
          { key: 'turboEnabled', label: 'Turbo', description: 'Runs the game faster while the Turbo shortcut is held. Music keeps its tempo.', keywords: turboKeywords },
          { key: 'turboSpeed', label: 'Turbo Speed', description: 'How much faster the game runs while the shortcut is held, from 1.25x up to 10x.', hint: 'Needs Turbo on.', keywords: turboKeywords },
        ],
      },
    ],
  },
  {
    id: 'received-items',
    title: 'Received Items',
    items: [
      { key: 'quietRupees', label: 'Quiet Rupees', description: 'Randomizer rupees arrive without a message.', keywords: 'quiet rupees message received randomizer archipelago online hold up' },
      { key: 'quietBombs', label: 'Quiet Bombs', description: 'Randomizer bombs arrive without a message.', keywords: 'quiet bombs message received randomizer archipelago online hold up' },
      { key: 'quietArrows', label: 'Quiet Arrows', description: 'Randomizer arrows arrive without a message.', keywords: 'quiet arrows message received randomizer archipelago online hold up' },
    ],
  },
  {
    id: 'movement',
    title: 'Movement',
    items: [
      { key: 'turnWhileDashing', label: 'Turn While Dashing', description: 'Change direction while using the Pegasus Boots dash', keywords: 'dash turn pegasus boots direction' },
      { key: 'mirrorToDarkworld', label: 'Mirror to Dark World', description: 'The Magic Mirror can warp you to the Dark World from the Light World', keywords: 'mirror warp dark world light world' },
      { key: 'cancelBirdTravel', label: 'Cancel Bird Travel', description: 'Cancel duck flight in progress by pressing the X button', keywords: 'bird duck cancel fly' },
      { key: 'allowDiving', label: 'Allow Diving with Flippers', description: 'Press B while swimming to duck under for a moment, out of reach of anything that would hit you.', keywords: 'dive diving swim underwater flippers b button dodge' },
    ],
  },
  {
    id: 'combat',
    title: 'Combat',
    items: [
      { key: 'collectItemsWithSword', label: 'Collect Items with Sword', description: 'Pick up hearts, rupees, and other items by slashing them with your sword', keywords: 'sword collect slash hearts items' },
      { key: 'breakPotsWithSword', label: 'Break Pots with Sword', description: 'Level 2 or higher swords can break pots by slashing them', keywords: 'pots sword break level' },
      { key: 'moreActiveBombs', label: 'More Active Bombs', description: 'Place up to 4 active bombs at once', keywords: 'bombs active limit' },
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
          { key: 'dialogSpeed', label: 'Text Speed', description: 'How fast text, pauses and scrolling play out: below Original slows typed lines, above it speeds everything, Instant skips the wait', keywords: 'dialog text speed fast slow instant pacing multiplier' },
          { key: 'dialogHoldToAccelerate', label: 'Hold A to Accelerate', description: 'While A is held, dialog plays at the speed on the right', keywords: 'dialog hold a accelerate fast forward speed button' },
          { key: 'dialogFillOnB', label: 'B Completes the Box', description: 'One press writes the whole box; the next press advances', keywords: 'dialog b complete fill box skip typing advance' },
          { key: 'dialogTypewriter', label: 'Type Letter by Letter', description: 'Lines the game shows all at once type out one letter at a time, so Text Speed sets the typing rate', keywords: 'dialog typewriter letter glyph typing rate slow text speed' },
        ],
      },
      {
        id: 'dialog-skipping',
        title: 'Skipping',
        items: [
          { key: 'autoSkipDialog', label: 'Auto-Skip Dialog', description: 'Show dialog text instantly and dismiss message boxes for you, including item-get text. Yes/no and shop prompts still wait for your answer.', keywords: 'dialog text skip fast auto advance message box speed instant' },
          { key: 'disableTelepathy', label: 'Disable Telepathic Messages', description: "Suppress the princess's periodic telepathic pleas while walking to the castle in the rain", keywords: 'princess telepathy rain message annoying skip' },
        ],
      },
    ],
  },
  {
    id: 'qol',
    title: 'Quality of Life',
    items: [
      { key: 'disableLowHealthBeep', label: 'Disable Low Heart Beep', description: 'Silence the repeating warning beep when your health is low', keywords: 'beep heart health warning annoying' },
      { key: 'skipIntroOnKeypress', label: 'Skip Intro on Keypress', description: 'Press any key to skip the intro and title screen sequence', keywords: 'intro skip key press' },
      { key: 'showMaxItemsInYellow', label: 'Indicate Max Resources', description: "Highlight rupees, bombs, and arrows in yellow when you're carrying the maximum amount", keywords: 'max yellow rupees bombs arrows' },
      { key: 'carryMoreRupees', label: 'Larger Wallet', description: 'Increase the maximum rupee capacity from 999 to 9999', keywords: 'rupees wallet money' },
      { key: 'prefillFileName', label: 'Prefill File Name', description: 'New files start named Link, with the cursor on End.', keywords: 'name file link new save naming end default' },
      { key: 'archeryNeedsBow', label: 'Archery Game Asks For A Bow', description: 'Stop the archery game from taking your money when you have nothing to shoot with; the owner tells you why instead.', keywords: 'archery shooting gallery target bow arrow minigame game refund fee rupees' },
      { key: 'mapOnSelect', label: 'Open Map with Select', description: 'Press the select button to open the map without going through the pause menu. Classic controls only.', keywords: 'map select button shortcut' },
    ],
  },
  {
    id: 'cheats',
    title: 'Cheats',
    items: [
      { key: 'cheatsEnabled', label: 'Enable Cheats', description: 'Master switch for every cheat: stats, items, combat and ignore collision.', keywords: 'cheat cheats enable master gate ignore collision walk through walls noclip kill enemies magic' },
    ],
  },
  {
    id: 'tracker',
    title: 'Tracker',
    items: [
      { key: 'trackerEnabled', label: 'Enable Checks Tracker', description: 'Turning this off stops the checks tracker updating.', keywords: 'tracker checks inventory save flags poll widget' },
    ],
  },
  {
    id: 'vanilla-safe',
    title: 'Vanilla Safe',
    items: [
      { key: 'vanillaSafe', label: 'Vanilla Safe', description: 'Forces off every feature, quality-of-life flag, bug fix, cheat, item override, custom player sprite and HUD override, so the game matches the original cartridge exactly. Harmless, low-risk divergences are included too; there are no exemptions.', keywords: 'vanilla safe parity original cartridge stock speedrun race lock' },
    ],
  },
];

export default withOwnRows(sections);
export { meta };
