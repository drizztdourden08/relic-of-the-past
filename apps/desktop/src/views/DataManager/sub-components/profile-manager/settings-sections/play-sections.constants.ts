/* @layer renderer-components @kind constants */
import { DEFAULT_TURBO_SPEED, formatTurboSpeed } from '@rotp/game-core';
import { formatDialogSpeed } from '@rotp/game-data';
import { capitalizeSetting } from './capitalize-setting';
import type { SettingsSection } from './settings-sections.type';

const GENERAL_SECTION: SettingsSection = {
  title: 'General',
  keys: [
    { key: 'displayPerfInTitle', label: 'FPS counter' },
    { key: 'vsync', label: 'V-Sync' },
    { key: 'turboEnabled', label: 'Turbo' },
    { key: 'turboSpeed', label: 'Turbo speed', format: (v) => formatTurboSpeed(Number(v ?? DEFAULT_TURBO_SPEED)) },
  ],
};

const SAVING_SECTION: SettingsSection = {
  title: 'Saving',
  keys: [
    { key: 'autoSaveEnabled', label: 'Auto-save' },
    { key: 'autoSaveIntervalSeconds', label: 'Auto-save interval', format: (v) => (v == null ? 'Default' : `${v} s`) },
    { key: 'autoSaveMaxEntries', label: 'Auto-saves kept' },
    { key: 'saveOnQuit', label: 'Save on quit' },
    { key: 'enhancedSaveSlotShortcut', label: 'Quick-save shortcut' },
    { key: 'saveHoldDuration', label: 'Save hold time', format: (v) => (v == null ? 'Default' : `${v} ms`) },
    { key: 'prefillFileName', label: 'Prefill file name' },
  ],
};

const GAMEPLAY_SECTION: SettingsSection = {
  title: 'Gameplay',
  keys: [
    { key: 'turnWhileDashing', label: 'Turn while dashing' },
    { key: 'allowDiving', label: 'Allow diving' },
    { key: 'mirrorToDarkworld', label: 'Mirror to Dark World' },
    { key: 'collectItemsWithSword', label: 'Collect items with sword' },
    { key: 'breakPotsWithSword', label: 'Break pots with sword' },
    { key: 'disableLowHealthBeep', label: 'Disable low health beep' },
    { key: 'skipIntroOnKeypress', label: 'Skip intro on keypress' },
    { key: 'showMaxItemsInYellow', label: 'Show max items in yellow' },
    { key: 'moreActiveBombs', label: 'More active bombs' },
    { key: 'carryMoreRupees', label: 'Carry more rupees' },
    { key: 'archeryNeedsBow', label: 'Archery needs a bow' },
    { key: 'miscBugFixes', label: 'Misc bug fixes' },
    { key: 'gameChangingBugFixes', label: 'Gameplay-altering bug fixes' },
    { key: 'cancelBirdTravel', label: 'Cancel bird travel' },
    { key: 'extraDungeon', label: 'Extra dungeon' },
    { key: 'vanillaSafe', label: 'Vanilla Safe' },
    { key: 'cheatsEnabled', label: 'Cheats' },
  ],
};

const DIALOG_SECTION: SettingsSection = {
  title: 'Dialog',
  keys: [
    { key: 'dialogSpeed', label: 'Text speed', format: (v) => formatDialogSpeed(Number(v ?? 1)) },
    { key: 'dialogHoldToAccelerate', label: 'Hold A to accelerate' },
    { key: 'dialogHoldSpeed', label: 'Hold speed', format: (v) => `${v ?? 2}x` },
    { key: 'dialogFillOnB', label: 'B completes the box' },
    { key: 'dialogTypewriter', label: 'Type letter by letter' },
    { key: 'autoSkipDialog', label: 'Auto-skip dialog' },
    { key: 'disableTelepathy', label: 'Disable telepathic messages' },
    { key: 'dialogBox', label: 'Message box', format: (v) => capitalizeSetting(v, 'original') },
    { key: 'dialogFont', label: 'Dialog font', format: (v) => capitalizeSetting(v, 'original') },
    { key: 'dialogFontScale', label: 'Font scale', format: (v) => `${v ?? 1}x` },
    { key: 'dialogButtonPrompts', label: 'Button prompts' },
  ],
};

export { DIALOG_SECTION, GAMEPLAY_SECTION, GENERAL_SECTION, SAVING_SECTION };
