/* @layer renderer-app @kind config */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { ScreenMeta, SectionDef } from '@drizztdourden08/brock-react';

const meta: ScreenMeta = { title: 'Gameplay', icon: 'gamepad-2', order: 1, keywords: ['gameplay', 'auto save', 'turbo', 'dialog', 'cheats', 'vanilla safe'] };

const turboKeywords = 'turbo fast forward speed up faster skip hold multiplier speedrun grind';

const asMinutes = (seconds: number): string => (seconds >= 60 ? `${Math.floor(seconds / 60)}m` : `${seconds}s`);
const asCount = (value: number): string => String(value);
const asSeconds = (value: number): string => `${value}s`;

const sections: SectionDef[] = [
  {
    id: 'game-flow',
    title: msg('settings-gameplay:section.game-flow.title'),
    subsections: [
      {
        id: 'save-auto',
        title: msg('settings-gameplay:section.save-auto.title'),
        items: [
          { key: 'autoSaveEnabled', label: msg('settings-gameplay:auto-save-enabled.label'), description: msg('settings-gameplay:auto-save-enabled.description'), keywords: 'auto save timer interval automatic' },
          { key: 'autoSaveIntervalSeconds', label: msg('settings-gameplay:auto-save-interval-seconds.label'), description: msg('settings-gameplay:auto-save-interval-seconds.description'), hint: msg('settings-gameplay:auto-save-interval-seconds.hint'), keywords: 'auto save interval time frequency', control: { kind: 'range', min: 60, max: 1800, step: 60, format: asMinutes } },
          { key: 'autoSaveMaxEntries', label: msg('settings-gameplay:auto-save-max-entries.label'), description: msg('settings-gameplay:auto-save-max-entries.description'), keywords: 'auto save max limit entries prune', control: { kind: 'range', min: 1, max: 20, step: 1, format: asCount } },
          { key: 'saveOnQuit', label: msg('settings-gameplay:save-on-quit.label'), description: msg('settings-gameplay:save-on-quit.description'), keywords: 'save quit close exit auto' },
        ],
      },
      {
        id: 'save-shortcuts',
        title: msg('settings-gameplay:section.save-shortcuts.title'),
        items: [
          { key: 'enhancedSaveSlotShortcut', label: msg('settings-gameplay:enhanced-save-slot-shortcut.label'), description: msg('settings-gameplay:enhanced-save-slot-shortcut.description'), keywords: 'save state slot shortcut enhanced menu overlay' },
          { key: 'saveHoldDuration', label: msg('settings-gameplay:save-hold-duration.label'), description: msg('settings-gameplay:save-hold-duration.description'), hint: msg('settings-gameplay:save-hold-duration.hint'), keywords: 'save hold duration time seconds', control: { kind: 'range', min: 1, max: 5, step: 0.5, format: asSeconds } },
        ],
      },
      {
        id: 'turbo',
        title: msg('settings-gameplay:section.turbo.title'),
        items: [
          { key: 'turboEnabled', label: msg('settings-gameplay:turbo-enabled.label'), description: msg('settings-gameplay:turbo-enabled.description'), keywords: turboKeywords },
          { key: 'turboSpeed', label: msg('settings-gameplay:turbo-speed.label'), description: msg('settings-gameplay:turbo-speed.description'), hint: msg('settings-gameplay:turbo-speed.hint'), keywords: turboKeywords },
        ],
      },
    ],
  },
  {
    id: 'received-items',
    title: msg('settings-gameplay:section.received-items.title'),
    items: [
      { key: 'quietRupees', label: msg('settings-gameplay:quiet-rupees.label'), description: msg('settings-gameplay:quiet-rupees.description'), keywords: 'quiet rupees message received randomizer archipelago online hold up' },
      { key: 'quietBombs', label: msg('settings-gameplay:quiet-bombs.label'), description: msg('settings-gameplay:quiet-bombs.description'), keywords: 'quiet bombs message received randomizer archipelago online hold up' },
      { key: 'quietArrows', label: msg('settings-gameplay:quiet-arrows.label'), description: msg('settings-gameplay:quiet-arrows.description'), keywords: 'quiet arrows message received randomizer archipelago online hold up' },
    ],
  },
  {
    id: 'movement',
    title: msg('settings-gameplay:section.movement.title'),
    items: [
      { key: 'turnWhileDashing', label: msg('settings-gameplay:turn-while-dashing.label'), description: msg('settings-gameplay:turn-while-dashing.description'), keywords: 'dash turn pegasus boots direction' },
      { key: 'mirrorToDarkworld', label: msg('settings-gameplay:mirror-to-darkworld.label'), description: msg('settings-gameplay:mirror-to-darkworld.description'), keywords: 'mirror warp dark world light world' },
      { key: 'cancelBirdTravel', label: msg('settings-gameplay:cancel-bird-travel.label'), description: msg('settings-gameplay:cancel-bird-travel.description'), keywords: 'bird duck cancel fly' },
      { key: 'allowDiving', label: msg('settings-gameplay:allow-diving.label'), description: msg('settings-gameplay:allow-diving.description'), keywords: 'dive diving swim underwater flippers b button dodge' },
    ],
  },
  {
    id: 'combat',
    title: msg('settings-gameplay:section.combat.title'),
    items: [
      { key: 'collectItemsWithSword', label: msg('settings-gameplay:collect-items-with-sword.label'), description: msg('settings-gameplay:collect-items-with-sword.description'), keywords: 'sword collect slash hearts items' },
      { key: 'breakPotsWithSword', label: msg('settings-gameplay:break-pots-with-sword.label'), description: msg('settings-gameplay:break-pots-with-sword.description'), keywords: 'pots sword break level' },
      { key: 'moreActiveBombs', label: msg('settings-gameplay:more-active-bombs.label'), description: msg('settings-gameplay:more-active-bombs.description'), keywords: 'bombs active limit' },
    ],
  },
  {
    id: 'dialog',
    title: msg('settings-gameplay:section.dialog.title'),
    subsections: [
      {
        id: 'dialog-pacing',
        title: msg('settings-gameplay:section.dialog-pacing.title'),
        items: [
          { key: 'dialogSpeed', label: msg('settings-gameplay:dialog-speed.label'), description: msg('settings-gameplay:dialog-speed.description'), keywords: 'dialog text speed fast slow instant pacing multiplier' },
          { key: 'dialogHoldToAccelerate', label: msg('settings-gameplay:dialog-hold-to-accelerate.label'), description: msg('settings-gameplay:dialog-hold-to-accelerate.description'), keywords: 'dialog hold a accelerate fast forward speed button' },
          { key: 'dialogFillOnB', label: msg('settings-gameplay:dialog-fill-on-b.label'), description: msg('settings-gameplay:dialog-fill-on-b.description'), keywords: 'dialog b complete fill box skip typing advance' },
          { key: 'dialogTypewriter', label: msg('settings-gameplay:dialog-typewriter.label'), description: msg('settings-gameplay:dialog-typewriter.description'), keywords: 'dialog typewriter letter glyph typing rate slow text speed' },
        ],
      },
      {
        id: 'dialog-skipping',
        title: msg('settings-gameplay:section.dialog-skipping.title'),
        items: [
          { key: 'autoSkipDialog', label: msg('settings-gameplay:auto-skip-dialog.label'), description: msg('settings-gameplay:auto-skip-dialog.description'), keywords: 'dialog text skip fast auto advance message box speed instant' },
          { key: 'disableTelepathy', label: msg('settings-gameplay:disable-telepathy.label'), description: msg('settings-gameplay:disable-telepathy.description'), keywords: 'princess telepathy rain message annoying skip' },
        ],
      },
      {
        id: 'dialog-letters',
        title: msg('settings-gameplay:section.dialog-letters.title'),
        items: [
          { key: 'extendedLetters', label: msg('settings-gameplay:extended-letters.label'), description: msg('settings-gameplay:extended-letters.description'), keywords: 'dialog accent accented letters latin translation language name font diacritic' },
          { key: 'languageScreens', label: msg('settings-gameplay:language-screens.label'), description: msg('settings-gameplay:language-screens.description'), keywords: 'screens menu pause file select name ending credits language translation' },
          { key: 'jaFileSelectStyle', label: msg('settings-gameplay:ja-file-select-style.label'), description: msg('settings-gameplay:ja-file-select-style.description'), keywords: 'japanese cartridge graphics intro hud copyright file select style' },
        ],
      },
    ],
  },
  {
    id: 'qol',
    title: msg('settings-gameplay:section.qol.title'),
    items: [
      { key: 'disableLowHealthBeep', label: msg('settings-gameplay:disable-low-health-beep.label'), description: msg('settings-gameplay:disable-low-health-beep.description'), keywords: 'beep heart health warning annoying' },
      { key: 'skipIntroOnKeypress', label: msg('settings-gameplay:skip-intro-on-keypress.label'), description: msg('settings-gameplay:skip-intro-on-keypress.description'), keywords: 'intro skip key press' },
      { key: 'showMaxItemsInYellow', label: msg('settings-gameplay:show-max-items-in-yellow.label'), description: msg('settings-gameplay:show-max-items-in-yellow.description'), keywords: 'max yellow rupees bombs arrows' },
      { key: 'carryMoreRupees', label: msg('settings-gameplay:carry-more-rupees.label'), description: msg('settings-gameplay:carry-more-rupees.description'), keywords: 'rupees wallet money' },
      { key: 'prefillFileName', label: msg('settings-gameplay:prefill-file-name.label'), description: msg('settings-gameplay:prefill-file-name.description'), keywords: 'name file link new save naming end default' },
      { key: 'archeryNeedsBow', label: msg('settings-gameplay:archery-needs-bow.label'), description: msg('settings-gameplay:archery-needs-bow.description'), keywords: 'archery shooting gallery target bow arrow minigame game refund fee rupees' },
      { key: 'mapOnSelect', label: msg('settings-gameplay:map-on-select.label'), description: msg('settings-gameplay:map-on-select.description'), keywords: 'map select button shortcut' },
    ],
  },
  {
    id: 'cheats',
    title: msg('settings-gameplay:section.cheats.title'),
    items: [
      { key: 'cheatsEnabled', label: msg('settings-gameplay:cheats-enabled.label'), description: msg('settings-gameplay:cheats-enabled.description'), keywords: 'cheat cheats enable master gate ignore collision walk through walls noclip kill enemies magic' },
    ],
  },
  {
    id: 'tracker',
    title: msg('settings-gameplay:section.tracker.title'),
    items: [
      { key: 'trackerEnabled', label: msg('settings-gameplay:tracker-enabled.label'), description: msg('settings-gameplay:tracker-enabled.description'), keywords: 'tracker checks inventory save flags poll widget' },
    ],
  },
  {
    id: 'vanilla-safe',
    title: msg('settings-gameplay:section.vanilla-safe.title'),
    items: [
      { key: 'vanillaSafe', label: msg('settings-gameplay:vanilla-safe.label'), description: msg('settings-gameplay:vanilla-safe.description'), keywords: 'vanilla safe parity original cartridge stock speedrun race lock' },
    ],
  },
];

export default sections;
export { meta };
