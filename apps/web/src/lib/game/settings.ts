/* @layer bridge-wasm @kind data */
/**
 * Game Settings — defaults, serialization to INI, and merge logic.
 */

import type { GameSettings } from '@shared/types/settings';
import { effectiveCustomRatio, detectScreenRatio, detectViewportRatio } from './aspect-ratio';

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
  extendedRendering: false,
  aspectRatio: '16:9',
  customAspectW: 0,
  customAspectH: 0,
  extendY: true,
  widescreenSprites: true,
  widescreenVisualFixes: true,
  linearWorldTilemap: false,
  ultrawideRendering: false,
  tallRendering: false,
  cameraLockToViewport: false,
  smoothTransitions: false,
  pauseOffscreenAI: false,

  // Graphics
  windowScale: 2,
  fullscreen: 0,
  newRenderer: true,
  enhancedMode7: true,
  noSpriteLimits: true,
  linearFiltering: false,
  dimFlashes: false,
  linkSprite: null,
  outputMethod: 'SDL',

  // Window (Electron-managed)
  windowMode: 'default',
  startFullscreen: false,
  viewportConstraint: 'none',

  // Mobile display
  renderIntoNotch: true,

  // Gameplay
  itemSwitchLR: false,
  itemSwitchLRLimit: false,
  inventoryReorder: false,
  secondaryItemSlots: false,
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
  perGroupVolume: false,
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
  customHudAspectW: 0,
  customHudAspectH: 0,
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

const boolToIni = (v: boolean): string => {
  return v ? '1' : '0';
};

const serializeToIni = (settings: GameSettings, msuPath?: string, language?: string): string => {
  // ExtendedAspectRatio now carries ONLY the ratio value (+ extend_y). Every rendering companion is an
  // individual [Features] key below (positive naming), so INI ↔ bridge ↔ registry stay aligned.
  // When extendedRendering is off the engine always gets vanilla 4:3 — no extra columns, no flags.
  const er = settings.extendedRendering;
  const parts: string[] = [];
  if (er) {
    if (settings.extendY) parts.push('extend_y');
    if (settings.aspectRatio === 'auto') {
      const { w, h } = detectViewportRatio(settings.renderIntoNotch);
      parts.push(`${w}:${h}`);
    } else if (settings.aspectRatio === 'screen') {
      const { w, h } = detectScreenRatio(true);
      parts.push(`${w}:${h}`);
    } else if (settings.aspectRatio === 'custom') {
      const { w, h } = effectiveCustomRatio(settings.customAspectW, settings.customAspectH, settings.renderIntoNotch);
      parts.push(`${w}:${h}`);
    } else {
      parts.push(settings.aspectRatio);
    }
  } else {
    parts.push('4:3');
  }
  const aspectValue = parts.join(', ');

  // Rendering feature flags — mirror buildFeatureFlags (live bridge) so boot config and live push agree.
  const wide = er && settings.aspectRatio !== '4:3';
  const renderFlags = {
    ExtendedRendering: er,
    LinearWorldTilemap: er && !!settings.linearWorldTilemap,
    UltrawideRendering: er && !!settings.ultrawideRendering,
    TallRendering: er && !!settings.tallRendering,
    WidescreenSprites: wide && settings.widescreenSprites,
    WidescreenVisualFixes: wide && settings.widescreenVisualFixes,
    PauseOffscreenAI: er && !!settings.pauseOffscreenAI,
    CameraLock: er && settings.cameraLockToViewport,
    SmoothTransitions: er && settings.cameraLockToViewport && !!settings.smoothTransitions,
  };
  const renderFlagsIni = Object.entries(renderFlags)
    .map(([k, v]) => `${k} = ${boolToIni(v)}`)
    .join('\n');

  return `[General]
${language ? `Language = ${language}\n` : ''}Autosave = ${boolToIni(settings.autosave)}
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
${settings.linkSprite ? 'LinkGraphics = /link_sprite.zspr\n' : ''}

[Sound]
EnableAudio = ${boolToIni(settings.enableAudio)}
AudioFreq = ${settings.audioFreq}
AudioChannels = ${settings.audioChannels}
AudioSamples = ${settings.audioSamples}
EnableMSU = ${settings.enableMSU}
ResumeMSU = ${boolToIni(settings.resumeMSU)}
MSUVolume = ${settings.msuVolume}
PerGroupVolume = ${boolToIni(settings.perGroupVolume)}
${msuPath ? `MSUPath = ${msuPath}
` : ''}
[Features]
ItemSwitchLR = ${boolToIni(settings.itemSwitchLR)}
ItemSwitchLRLimit = ${boolToIni(settings.itemSwitchLRLimit)}
InventoryReorder = ${boolToIni(settings.inventoryReorder)}
SecondaryItemSlots = ${boolToIni(settings.secondaryItemSlots)}
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
${renderFlagsIni}
`;
};

const mergeSettings = (partial: Partial<GameSettings>): GameSettings => {
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
  // Migrate the removed '18:9' preset to an equivalent custom ratio (screen + HUD)
  if ((merged.aspectRatio as string) === '18:9') {
    merged.aspectRatio = 'custom';
    merged.customAspectW = 18;
    merged.customAspectH = 9;
  }
  if ((merged.hudRatio as string) === '18:9') {
    merged.hudRatio = 'custom';
    merged.customHudAspectW = 18;
    merged.customHudAspectH = 9;
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

  // Migration: new capability gates (default off). Existing profiles that already have a ratio
  // requiring these capabilities get them implicitly enabled so nothing silently regresses.
  if (!('extendedRendering' in raw)) {
    merged.extendedRendering = merged.aspectRatio !== '4:3';
  }
  if (!('linearWorldTilemap' in raw)) {
    const needsLinear = merged.aspectRatio === '21:9' || merged.aspectRatio === '32:9' ||
      (merged.aspectRatio === 'custom' && (merged.customAspectW / merged.customAspectH) > 2.2);
    merged.linearWorldTilemap = needsLinear;
  }
  if (!('ultrawideRendering' in raw)) {
    merged.ultrawideRendering = merged.aspectRatio === '32:9' ||
      (merged.aspectRatio === 'custom' && (merged.customAspectW / merged.customAspectH) > 2.4);
  }
  if (!('tallRendering' in raw)) {
    const isTall = merged.aspectRatio === 'custom' &&
      merged.customAspectH > 0 && (merged.customAspectW / merged.customAspectH) < 1.333;
    merged.tallRendering = isTall;
  }

  // Positive-naming migration: the old inverted fields (unchangedSprites / noVisualFixes) flip to their
  // positive equivalents so existing profiles keep the same behavior. Then strip the old keys.
  if ('unchangedSprites' in raw && !('widescreenSprites' in raw)) {
    merged.widescreenSprites = !raw.unchangedSprites;
  }
  if ('noVisualFixes' in raw && !('widescreenVisualFixes' in raw)) {
    merged.widescreenVisualFixes = !raw.noVisualFixes;
  }
  delete (merged as Record<string, unknown>).unchangedSprites;
  delete (merged as Record<string, unknown>).noVisualFixes;

  // Inventory reorder + secondary X/L/R item slots used to be bundled under itemSwitchLR. Existing profiles
  // that had Advanced Item Selection on keep both behaviors; otherwise they default off (vanilla).
  if (!('inventoryReorder' in raw)) merged.inventoryReorder = merged.itemSwitchLR;
  if (!('secondaryItemSlots' in raw)) merged.secondaryItemSlots = merged.itemSwitchLR;

  // perGroupVolume used to be auto-derived from the sliders. Existing profiles that had a non-default mix
  // get the explicit toggle turned on so their audio doesn't silently revert to the stock mix.
  if (!('perGroupVolume' in raw)) {
    merged.perGroupVolume = merged.musicVolume !== 100 || merged.sfxVolume !== 100 || merged.musicMuted || merged.sfxMuted;
  }

  return merged;
};

export { DEFAULT_SETTINGS, mergeSettings, serializeToIni };
