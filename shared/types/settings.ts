import type { FunctionMapping } from './controls';

/** Per-profile game settings — mirrors zelda3 config.h / zelda3.ini fields */
interface GameSettings {
  // ─── General ───
  autosave: boolean;
  displayPerfInTitle: boolean;
  disableFrameDelay: boolean;

  // ─── Aspect Ratio & Display ───
  aspectRatio: '4:3' | '3:2' | '16:9' | '16:10' | '18:9';
  extendY: boolean;
  unchangedSprites: boolean;
  noVisualFixes: boolean;

  // ─── Graphics ───
  windowScale: number; // 1-5 (legacy, unused in Electron)
  fullscreen: 0 | 1 | 2; // legacy INI field
  newRenderer: boolean;
  enhancedMode7: boolean;
  noSpriteLimits: boolean;
  linearFiltering: boolean;
  dimFlashes: boolean;
  outputMethod: 'SDL' | 'SDL-Software' | 'OpenGL' | 'OpenGL ES'; // legacy, unused in Electron

  // ─── Window (Electron-managed) ───
  windowMode: 'default' | 'borderless';
  startFullscreen: boolean;
  viewportConstraint: 'none' | 'fit' | 'fill';

  // ─── Gameplay features ───
  itemSwitchLR: boolean;
  itemSwitchLRLimit: boolean;
  turnWhileDashing: boolean;
  mirrorToDarkworld: boolean;
  collectItemsWithSword: boolean;
  breakPotsWithSword: boolean;
  disableLowHealthBeep: boolean;
  skipIntroOnKeypress: boolean;
  showMaxItemsInYellow: boolean;
  moreActiveBombs: boolean;
  carryMoreRupees: boolean;
  miscBugFixes: boolean;
  gameChangingBugFixes: boolean;
  cancelBirdTravel: boolean;

  // ─── Audio ───
  enableAudio: boolean;
  masterVolume: number; // 0-100
  audioFreq: number;
  audioChannels: 1 | 2;
  audioSamples: number;
  enableMSU: 'false' | 'true' | 'deluxe' | 'opuz' | 'deluxe-opuz';
  resumeMSU: boolean;
  msuVolume: number; // 0-100

  // ─── Enhancements ───
  overworldEdgeEffect: boolean;
  forceBackdropBlack: boolean;

  // ─── Controls ───
  activeInputProfileId: string | null;
  functionMappings?: FunctionMapping[];
  enhancedSaveSlotShortcut: boolean;
  saveHoldDuration: number; // seconds, 1-5
}

export type { GameSettings };
