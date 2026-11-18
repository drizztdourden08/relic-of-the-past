/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { DEFAULT_TURBO_SPEED, formatTurboSpeed } from '@rotp/game-core';
import { formatDialogSpeed } from '@app/settings-controls/gameplay/format-dialog-speed';
import { capitalizeSetting } from './capitalize-setting';
import type { SettingsSection } from './settings-sections.type';

const GENERAL_SECTION: SettingsSection = {
  title: msg('data-manager:settings-sections.title.general'),
  keys: [
    { key: 'displayPerfInTitle', label: msg('data-manager:settings-sections.label.display-perf-in-title') },
    { key: 'vsync', label: msg('data-manager:settings-sections.label.vsync') },
    { key: 'turboEnabled', label: msg('data-manager:settings-sections.label.turbo-enabled') },
    { key: 'turboSpeed', label: msg('data-manager:settings-sections.label.turbo-speed'), format: (v) => formatTurboSpeed(Number(v ?? DEFAULT_TURBO_SPEED)) },
  ],
};

const SAVING_SECTION: SettingsSection = {
  title: msg('data-manager:settings-sections.title.saving'),
  keys: [
    { key: 'autoSaveEnabled', label: msg('data-manager:settings-sections.label.auto-save-enabled') },
    { key: 'autoSaveIntervalSeconds', label: msg('data-manager:settings-sections.label.auto-save-interval-seconds'), format: (v, t) => (v == null ? t('data-manager:settings-sections.value.default') : `${v} s`) },
    { key: 'autoSaveMaxEntries', label: msg('data-manager:settings-sections.label.auto-save-max-entries') },
    { key: 'saveOnQuit', label: msg('data-manager:settings-sections.label.save-on-quit') },
    { key: 'enhancedSaveSlotShortcut', label: msg('data-manager:settings-sections.label.enhanced-save-slot-shortcut') },
    { key: 'saveHoldDuration', label: msg('data-manager:settings-sections.label.save-hold-duration'), format: (v, t) => (v == null ? t('data-manager:settings-sections.value.default') : `${v} ms`) },
    { key: 'prefillFileName', label: msg('data-manager:settings-sections.label.prefill-file-name') },
  ],
};

const GAMEPLAY_SECTION: SettingsSection = {
  title: msg('data-manager:settings-sections.title.gameplay'),
  keys: [
    { key: 'turnWhileDashing', label: msg('data-manager:settings-sections.label.turn-while-dashing') },
    { key: 'allowDiving', label: msg('data-manager:settings-sections.label.allow-diving') },
    { key: 'mirrorToDarkworld', label: msg('data-manager:settings-sections.label.mirror-to-darkworld') },
    { key: 'collectItemsWithSword', label: msg('data-manager:settings-sections.label.collect-items-with-sword') },
    { key: 'breakPotsWithSword', label: msg('data-manager:settings-sections.label.break-pots-with-sword') },
    { key: 'disableLowHealthBeep', label: msg('data-manager:settings-sections.label.disable-low-health-beep') },
    { key: 'skipIntroOnKeypress', label: msg('data-manager:settings-sections.label.skip-intro-on-keypress') },
    { key: 'showMaxItemsInYellow', label: msg('data-manager:settings-sections.label.show-max-items-in-yellow') },
    { key: 'moreActiveBombs', label: msg('data-manager:settings-sections.label.more-active-bombs') },
    { key: 'carryMoreRupees', label: msg('data-manager:settings-sections.label.carry-more-rupees') },
    { key: 'archeryNeedsBow', label: msg('data-manager:settings-sections.label.archery-needs-bow') },
    { key: 'miscBugFixes', label: msg('data-manager:settings-sections.label.misc-bug-fixes') },
    { key: 'gameChangingBugFixes', label: msg('data-manager:settings-sections.label.game-changing-bug-fixes') },
    { key: 'cancelBirdTravel', label: msg('data-manager:settings-sections.label.cancel-bird-travel') },
    { key: 'extraDungeon', label: msg('data-manager:settings-sections.label.extra-dungeon') },
    { key: 'vanillaSafe', label: msg('data-manager:settings-sections.label.vanilla-safe') },
    { key: 'cheatsEnabled', label: msg('data-manager:settings-sections.label.cheats-enabled') },
  ],
};

const DIALOG_SECTION: SettingsSection = {
  title: msg('data-manager:settings-sections.title.dialog'),
  keys: [
    { key: 'dialogSpeed', label: msg('data-manager:settings-sections.label.dialog-speed'), format: (v) => formatDialogSpeed(Number(v ?? 1)) },
    { key: 'dialogHoldToAccelerate', label: msg('data-manager:settings-sections.label.dialog-hold-to-accelerate') },
    { key: 'dialogHoldSpeed', label: msg('data-manager:settings-sections.label.dialog-hold-speed'), format: (v) => `${v ?? 2}x` },
    { key: 'dialogFillOnB', label: msg('data-manager:settings-sections.label.dialog-fill-on-b') },
    { key: 'dialogTypewriter', label: msg('data-manager:settings-sections.label.dialog-typewriter') },
    { key: 'autoSkipDialog', label: msg('data-manager:settings-sections.label.auto-skip-dialog') },
    { key: 'disableTelepathy', label: msg('data-manager:settings-sections.label.disable-telepathy') },
    { key: 'extendedLetters', label: msg('data-manager:settings-sections.label.extended-letters') },
    { key: 'languageScreens', label: msg('data-manager:settings-sections.label.language-screens') },
    { key: 'jaFileSelectStyle', label: msg('data-manager:settings-sections.label.ja-file-select-style') },
    { key: 'dialogBox', label: msg('data-manager:settings-sections.label.dialog-box'), format: (v, t) => capitalizeSetting(v, 'original', t) },
    { key: 'dialogFont', label: msg('data-manager:settings-sections.label.dialog-font'), format: (v, t) => capitalizeSetting(v, 'original', t) },
    { key: 'dialogFontScale', label: msg('data-manager:settings-sections.label.dialog-font-scale'), format: (v) => `${v ?? 1}x` },
    { key: 'dialogButtonPrompts', label: msg('data-manager:settings-sections.label.dialog-button-prompts') },
  ],
};

export { DIALOG_SECTION, GAMEPLAY_SECTION, GENERAL_SECTION, SAVING_SECTION };
