/* @layer renderer-components @kind logic */
/** Section config for the Gameplay settings tab. */
import type { Section } from '../../../compounds/SettingsLayout';

const TURBO_KEYWORDS = 'turbo fast forward speed up faster skip hold multiplier speedrun grind';

// Save states and turbo share a section: both act on the running game from outside its own
// rules, one moving where you resume, the other how fast it runs. Exported because its
// controls are rendered by gameplay-settings-controls.
const GAME_FLOW_SECTION: Section = {
  id: 'game-flow',
  title: 'Game Flow',
  subsections: [
    {
      id: 'save-auto',
      title: 'Auto-Save',
      items: [
        { key: 'autoSaveEnabled', label: 'Enable Auto-Save', description: 'Automatically create save state snapshots at regular intervals during gameplay', keywords: 'auto save timer interval automatic' },
        { key: 'autoSaveIntervalSeconds', label: 'Auto-Save Interval', description: 'How often to create an automatic save (in seconds)', keywords: 'auto save interval time frequency' },
        { key: 'autoSaveMaxEntries', label: 'Max Auto-Save Entries', description: 'Maximum number of auto-saves to keep (oldest are pruned)', keywords: 'auto save max limit entries prune' },
        { key: 'saveOnQuit', label: 'Save on Quit', description: 'Automatically create a save state when you stop the game or close the app', keywords: 'save quit close exit auto' },
      ],
    },
    {
      id: 'save-shortcuts',
      title: 'Quick Save Shortcuts',
      items: [
        { key: 'enhancedSaveSlotShortcut', label: 'Enhanced Save Slot Shortcut', description: 'Opens the save slot menu on shortcut press instead of immediately saving/loading', keywords: 'save state slot shortcut enhanced menu overlay' },
        { key: 'saveHoldDuration', label: 'Hold to Save Duration', description: 'How long to hold the key to save (seconds)', keywords: 'save hold duration time seconds' },
      ],
    },
    {
      id: 'turbo',
      title: 'Turbo',
      items: [
        { key: 'turboEnabled', label: 'Turbo', description: 'Run the game faster than normal while the Turbo shortcut is held. Bind the shortcut under Controls. Music keeps its own tempo; everything else moves at the chosen speed.', keywords: TURBO_KEYWORDS },
        { key: 'turboSpeed', label: 'Turbo Speed', description: 'How much faster the game runs while the shortcut is held, from 1.25x up to 10x.', keywords: TURBO_KEYWORDS },
      ],
    },
  ],
};

const SECTIONS: Section[] = [
  // Save states live here instead of in a tab of their own. They are part of how the game is
  // played, not a property of the host.
  GAME_FLOW_SECTION,
  {
    id: 'items',
    title: 'Items',
    items: [
      { key: 'itemSwitchLR', label: 'Advanced Item Selection', description: 'Use L and R shoulder buttons to cycle through your equipped items', keywords: 'item cycle lr bumper' },
      { key: 'itemSwitchLRLimit', label: 'Limit to First 4 Items', description: 'When cycling with L/R, only rotate through the first 4 item slots', keywords: 'item limit slots' },
      { key: 'secondaryItemSlots', label: 'Secondary Item Slots (X / L / R)', description: 'Assign separate items to the X, L, and R buttons instead of just Y. Not in the original game.', keywords: 'secondary item slot x l r buttons assign' },
      { key: 'inventoryReorder', label: 'Reorder Inventory', description: 'Hold Y and press a direction in the inventory to move items around. Not in the original game.', keywords: 'inventory reorder rearrange organize items y arrows' },
    ],
  },
  {
    id: 'movement',
    title: 'Movement',
    items: [
      { key: 'turnWhileDashing', label: 'Turn While Dashing', description: 'Change direction while using the Pegasus Boots dash', keywords: 'dash turn pegasus boots direction' },
      { key: 'mirrorToDarkworld', label: 'Mirror to Dark World', description: 'The Magic Mirror can warp you to the Dark World from the Light World', keywords: 'mirror warp dark world light world' },
      { key: 'cancelBirdTravel', label: 'Cancel Bird Travel', description: 'Cancel duck flight in progress by pressing the X button', keywords: 'bird duck cancel fly' },
    ],
  },
  {
    id: 'combat',
    title: 'Combat',
    items: [
      { key: 'collectItemsWithSword', label: 'Collect Items with Sword', description: 'Pick up hearts, rupees, and other items by slashing them with your sword', keywords: 'sword collect slash hearts items' },
      { key: 'breakPotsWithSword', label: 'Break Pots with Sword', description: 'Level 2 or higher swords can break pots by slashing them', keywords: 'pots sword break level' },
      { key: 'moreActiveBombs', label: 'More Active Bombs', description: 'Place up to 4 active bombs at once instead of the original limit of 2', keywords: 'bombs active limit' },
    ],
  },
  {
    id: 'qol',
    title: 'Quality of Life',
    items: [
      { key: 'disableLowHealthBeep', label: 'Disable Low Heart Beep', description: 'Silence the repeating warning beep when your health is low', keywords: 'beep heart health warning annoying' },
      { key: 'skipIntroOnKeypress', label: 'Skip Intro on Keypress', description: 'Press any key to skip the intro and title screen sequence', keywords: 'intro skip key press' },
      { key: 'disableTelepathy', label: 'Disable Telepathic Messages', description: 'Suppress the princess\'s periodic telepathic pleas while walking to the castle in the rain', keywords: 'princess telepathy rain message annoying skip' },
      { key: 'showMaxItemsInYellow', label: 'Indicate Max Resources', description: 'Highlight rupees, bombs, and arrows in yellow when you\'re carrying the maximum amount', keywords: 'max yellow rupees bombs arrows' },
      { key: 'carryMoreRupees', label: 'Larger Wallet', description: 'Increase the maximum rupee capacity from 999 to 9999', keywords: 'rupees wallet money' },
      { key: 'autoSkipDialog', label: 'Auto-Skip Dialog', description: 'Show dialog text instantly and dismiss message boxes for you, including item-get text. Yes/no and shop prompts still wait for your answer. Not in the original game.', keywords: 'dialog text skip fast auto advance message box speed instant' },
      { key: 'prefillFileName', label: 'Prefill File Name', description: 'New files start named Link, with the cursor on End.', keywords: 'name file link new save naming end default' },
      { key: 'archeryNeedsBow', label: 'Archery Game Asks For A Bow', description: 'Stop the archery game from taking your money when you have nothing to shoot with; the owner tells you why instead. Not in the original game.', keywords: 'archery shooting gallery target bow arrow minigame game refund fee rupees' },
    ],
  },
  {
    id: 'cheats',
    title: 'Cheats',
    items: [
      { key: 'cheatsEnabled', label: 'Enable Cheats', description: 'Master gate for every cheat (stats, items, combat, ignore collision). Off by default: every cheat no-ops in the C core while this is off, so leaving it off can never affect gameplay.', keywords: 'cheat cheats enable master gate ignore collision walk through walls noclip kill enemies magic' },
    ],
  },
  {
    id: 'tracker',
    title: 'Tracker',
    items: [
      { key: 'trackerEnabled', label: 'Enable Checks Tracker', description: 'The checks tracker reads inventory and save flags out of the running game. Turning it off stops that polling and the tracker stops updating.', keywords: 'tracker checks inventory save flags poll widget' },
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

export { SECTIONS, GAME_FLOW_SECTION };
