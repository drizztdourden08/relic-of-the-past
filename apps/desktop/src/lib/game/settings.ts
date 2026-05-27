/**
 * Game Settings — defaults, serialization to INI, and merge logic.
 */

import type { GameSettings } from '@shared/types/settings';

const DEFAULT_SETTINGS: GameSettings = {
  // General
  autosave: false,
  autoSaveEnabled: false,
  autoSaveIntervalSeconds: 300,
  autoSaveMaxEntries: 5,
  saveOnQuit: true,
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
  linearFiltering: false,
  dimFlashes: false,
  outputMethod: 'SDL',

  // Window (Electron-managed)
  windowMode: 'default',
  startFullscreen: false,
  viewportConstraint: 'none',

  // Gameplay
  itemSwitchLR: false,
  itemSwitchLRLimit: false,
  turnWhileDashing: false,
  mirrorToDarkworld: false,
  collectItemsWithSword: false,
  breakPotsWithSword: false,
  disableLowHealthBeep: false,
  skipIntroOnKeypress: false,
  disableTelepathy: false,
  showMaxItemsInYellow: false,
  moreActiveBombs: false,
  carryMoreRupees: false,
  miscBugFixes: false,
  gameChangingBugFixes: false,
  cancelBirdTravel: false,

  // Audio
  enableAudio: true,
  masterVolume: 100,
  musicVolume: 100,
  musicMuted: false,
  sfxVolume: 100,
  sfxMuted: false,
  audioFreq: 44100,
  audioChannels: 2,
  audioSamples: 2048,
  enableMSU: 'false',
  resumeMSU: true,
  msuVolume: 100,

  // Post-Processing
  overworldEdgeEffect: true,
  postProcessingShadows: false,
  forceBackdropBlack: false,

  // HUD
  hudMode: 'original',
  hudStyle: 'vanilla',
  hudRatio: 'match',
  hudEnhancedParts: ['main', 'pause'],
  hudHeartMode: 'original',
  hudMagicMode: 'original',
  hudCountLayout: 'centered',
  hudPauseStyle: 'vanilla',
  hudPauseHighlight: 'box',

  // Controls
  activeInputProfileId: null,
  enhancedSaveSlotShortcut: true,
  saveHoldDuration: 2,

  // Notifications
  showRegionNotification: true,
  showTransitionNotification: true,

  // Haptics
  haptics: {
    enabled: true,
    intensity: 70,
    swordSwing: true,
    swordHitEnemy: true,
    swordClink: true,
    damageTaken: true,
    itemUse: true,
    dashVibration: true,
    environmentalEffects: true,
  },
};

function boolToIni(v: boolean): string {
  return v ? '1' : '0';
}

/** Serialize GameSettings to a zelda3.ini string for WASM consumption. */
function serializeToIni(settings: GameSettings, msuPath?: string): string {
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
${msuPath ? `MSUPath = ${msuPath}
` : ''}
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
DisableTelepathy = ${boolToIni(settings.disableTelepathy)}
`;
}

/** Merge partial settings over defaults, producing a complete GameSettings. */
function mergeSettings(partial: Partial<GameSettings>): GameSettings {
  const merged = { ...DEFAULT_SETTINGS, ...partial };

  // Migrate old windowMode values from previous schema
  const rawMode = (partial as Record<string, unknown>).windowMode;
  if (rawMode === 'normal') {
    merged.windowMode = 'default';
  } else if (rawMode === 'fullscreen') {
    merged.windowMode = 'default';
    merged.startFullscreen = true;
  }

  // Migrate old ignoreAspectRatio / lockToGameRatio / stretch to viewportConstraint
  const raw = partial as Record<string, unknown>;
  if (!('viewportConstraint' in raw)) {
    if (raw.lockToGameRatio === true) {
      merged.viewportConstraint = 'fit';
    } else if (raw.ignoreAspectRatio === true || raw.aspectRatio === 'stretch') {
      merged.viewportConstraint = 'fill';
    }
  }
  // Fix aspectRatio if it was set to the removed 'stretch' value
  if ((merged.aspectRatio as string) === 'stretch') {
    merged.aspectRatio = '16:9';
  }
  // Strip removed fields so they don't persist
  delete (merged as Record<string, unknown>).ignoreAspectRatio;
  delete (merged as Record<string, unknown>).lockToGameRatio;

  // Ensure masterVolume has a valid value (old configs won't have it)
  if (merged.masterVolume == null || typeof merged.masterVolume !== 'number') {
    merged.masterVolume = 100;
  }

  // enableAudio is no longer exposed in UI; always keep enabled
  merged.enableAudio = true;

  return merged;
}

export { DEFAULT_SETTINGS, mergeSettings, serializeToIni };
