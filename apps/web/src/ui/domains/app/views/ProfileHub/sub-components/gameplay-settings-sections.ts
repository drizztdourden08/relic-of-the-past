/* @layer renderer-components @kind logic */
/** Section/subsection config for the Gameplay settings tab. */
import type { Section } from '../../../compounds/SettingsLayout';

// Save-state management lives in the System tab now (it's app/host scope, not gameplay behavior).
// Exported here because its controls are rendered by gameplay-settings-controls (shared renderer).
const SAVE_SECTION: Section = {
  id: 'save-states',
  title: 'Save States',
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
  ],
};

const SECTIONS: Section[] = [
  {
    id: 'items',
    title: 'Items',
    subsections: [
      {
        id: 'items-management',
        title: 'Item Management',
        items: [
          { key: 'itemSwitchLR', label: 'Advanced Item Selection', description: 'Use L and R shoulder buttons to cycle through your equipped items', keywords: 'item cycle lr bumper' },
          { key: 'itemSwitchLRLimit', label: 'Limit to First 4 Items', description: 'When cycling with L/R, only rotate through the first 4 item slots', keywords: 'item limit slots' },
          { key: 'secondaryItemSlots', label: 'Secondary Item Slots (X / L / R)', description: 'Assign separate items to the X, L, and R buttons instead of just Y. Not in the original game.', keywords: 'secondary item slot x l r buttons assign' },
          { key: 'inventoryReorder', label: 'Reorder Inventory', description: 'Hold Y and press a direction in the inventory to move items around. Not in the original game.', keywords: 'inventory reorder rearrange organize items y arrows' },
        ],
      },
    ],
  },
  {
    id: 'movement',
    title: 'Movement',
    subsections: [
      {
        id: 'movement-options',
        title: 'Options',
        items: [
          { key: 'turnWhileDashing', label: 'Turn While Dashing', description: 'Change direction while using the Pegasus Boots dash', keywords: 'dash turn pegasus boots direction' },
          { key: 'mirrorToDarkworld', label: 'Mirror to Dark World', description: 'The Magic Mirror can warp you to the Dark World from the Light World', keywords: 'mirror warp dark world light world' },
          { key: 'cancelBirdTravel', label: 'Cancel Bird Travel', description: 'Cancel duck flight in progress by pressing the X button', keywords: 'bird duck cancel fly' },
        ],
      },
    ],
  },
  {
    id: 'combat',
    title: 'Combat',
    subsections: [
      {
        id: 'combat-options',
        title: 'Options',
        items: [
          { key: 'collectItemsWithSword', label: 'Collect Items with Sword', description: 'Pick up hearts, rupees, and other items by slashing them with your sword', keywords: 'sword collect slash hearts items' },
          { key: 'breakPotsWithSword', label: 'Break Pots with Sword', description: 'Level 2 or higher swords can break pots by slashing them', keywords: 'pots sword break level' },
          { key: 'moreActiveBombs', label: 'More Active Bombs', description: 'Place up to 4 active bombs at once instead of the original limit of 2', keywords: 'bombs active limit' },
        ],
      },
    ],
  },
  {
    id: 'qol',
    title: 'Quality of Life',
    subsections: [
      {
        id: 'qol-options',
        title: 'Options',
        items: [
          { key: 'disableLowHealthBeep', label: 'Disable Low Heart Beep', description: 'Silence the repeating warning beep when your health is low', keywords: 'beep heart health warning annoying' },
          { key: 'skipIntroOnKeypress', label: 'Skip Intro on Keypress', description: 'Press any key to skip the intro and title screen sequence', keywords: 'intro skip key press' },
          { key: 'disableTelepathy', label: 'Disable Telepathic Messages', description: 'Suppress Zelda\'s periodic telepathic pleas while walking to the castle in the rain', keywords: 'zelda telepathy rain message annoying skip' },
          { key: 'showMaxItemsInYellow', label: 'Indicate Max Resources', description: 'Highlight rupees, bombs, and arrows in yellow when you\'re carrying the maximum amount', keywords: 'max yellow rupees bombs arrows' },
          { key: 'carryMoreRupees', label: 'Larger Wallet', description: 'Increase the maximum rupee capacity from 999 to 9999', keywords: 'rupees wallet money' },
          { key: 'autoSkipDialog', label: 'Auto-Skip Dialog', description: 'Show dialog text instantly and dismiss message boxes for you, including item-get text. Yes/no and shop prompts still wait for your answer. Not in the original game.', keywords: 'dialog text skip fast auto advance message box speed instant' },
        ],
      },
    ],
  },
];

export { SECTIONS, SAVE_SECTION };
