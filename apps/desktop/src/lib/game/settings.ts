/**
 * Game Settings — defaults, serialization to INI, and merge logic.
 */

import type { GameSettings } from '@shared/types/settings';

export const DEFAULT_SETTINGS: GameSettings = {
  // General
  autosave: false,
  displayPerfInTitle: false,
  disableFrameDelay: false,

  // Aspect Ratio & Display
  aspectRatio: '16:9',
  extendY: true,
  unchangedSprites: false,
  noVisualFixes: false,

  // Graphics
  windowScale: 2,
  fullscreen: 0,
  newRenderer: true,
  enhancedMode7: true,
  noSpriteLimits: true,
  ignoreAspectRatio: false,
  linearFiltering: false,
  dimFlashes: false,
  outputMethod: 'SDL',

  // Gameplay
  itemSwitchLR: false,
  itemSwitchLRLimit: false,
  turnWhileDashing: false,
  mirrorToDarkworld: false,
  collectItemsWithSword: false,
  breakPotsWithSword: false,
  disableLowHealthBeep: false,
  skipIntroOnKeypress: false,
  showMaxItemsInYellow: false,
  moreActiveBombs: false,
  carryMoreRupees: false,
  miscBugFixes: false,
  gameChangingBugFixes: false,
  cancelBirdTravel: false,

  // Audio
  enableAudio: true,
  audioFreq: 44100,
  audioChannels: 2,
  audioSamples: 2048,
  enableMSU: 'false',
  resumeMSU: true,
  msuVolume: 100,
};

function boolToIni(v: boolean): string {
  return v ? '1' : '0';
}

/** Serialize GameSettings to a zelda3.ini string for WASM consumption. */
export function serializeToIni(settings: GameSettings): string {
  // Build ExtendedAspectRatio value with modifiers
  const parts: string[] = [];
  if (settings.extendY) parts.push('extend_y');
  parts.push(settings.aspectRatio);
  if (settings.unchangedSprites) parts.push('unchanged_sprites');
  if (settings.noVisualFixes) parts.push('no_visual_fixes');
  const aspectValue = parts.join(', ');

  return `[General]
Autosave = ${boolToIni(settings.autosave)}
DisplayPerfInTitle = ${boolToIni(settings.displayPerfInTitle)}
DisableFrameDelay = ${boolToIni(settings.disableFrameDelay)}
ExtendedAspectRatio = ${aspectValue}

[Graphics]
WindowSize = Auto
Fullscreen = ${settings.fullscreen}
WindowScale = ${settings.windowScale}
NewRenderer = ${boolToIni(settings.newRenderer)}
EnhancedMode7 = ${boolToIni(settings.enhancedMode7)}
IgnoreAspectRatio = ${boolToIni(settings.ignoreAspectRatio)}
NoSpriteLimits = ${boolToIni(settings.noSpriteLimits)}
LinearFiltering = ${boolToIni(settings.linearFiltering)}
OutputMethod = ${settings.outputMethod}
DimFlashes = ${boolToIni(settings.dimFlashes)}

[Sound]
EnableAudio = ${boolToIni(settings.enableAudio)}
AudioFreq = ${settings.audioFreq}
AudioChannels = ${settings.audioChannels}
AudioSamples = ${settings.audioSamples}
EnableMSU = ${settings.enableMSU}
ResumeMSU = ${boolToIni(settings.resumeMSU)}
MSUVolume = ${settings.msuVolume}

[Features]
ItemSwitchLR = ${boolToIni(settings.itemSwitchLR)}
ItemSwitchLRLimit = ${boolToIni(settings.itemSwitchLRLimit)}
TurnWhileDashing = ${boolToIni(settings.turnWhileDashing)}
MirrorToDarkworld = ${boolToIni(settings.mirrorToDarkworld)}
CollectItemsWithSword = ${boolToIni(settings.collectItemsWithSword)}
BreakPotsWithSword = ${boolToIni(settings.breakPotsWithSword)}
DisableLowHealthBeep = ${boolToIni(settings.disableLowHealthBeep)}
SkipIntroOnKeypress = ${boolToIni(settings.skipIntroOnKeypress)}
ShowMaxItemsInYellow = ${boolToIni(settings.showMaxItemsInYellow)}
MoreActiveBombs = ${boolToIni(settings.moreActiveBombs)}
CarryMoreRupees = ${boolToIni(settings.carryMoreRupees)}
MiscBugFixes = ${boolToIni(settings.miscBugFixes)}
GameChangingBugFixes = ${boolToIni(settings.gameChangingBugFixes)}
CancelBirdTravel = ${boolToIni(settings.cancelBirdTravel)}
`;
}

/** Merge partial settings over defaults, producing a complete GameSettings. */
export function mergeSettings(partial: Partial<GameSettings>): GameSettings {
  return { ...DEFAULT_SETTINGS, ...partial };
}
