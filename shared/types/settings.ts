/** Per-profile game settings — mirrors zelda3 config.h / zelda3.ini fields */
export interface GameSettings {
  // ─── General ───
  autosave: boolean;
  displayPerfInTitle: boolean;
  disableFrameDelay: boolean;

  // ─── Aspect Ratio & Display ───
  aspectRatio: '4:3' | '16:9' | '16:10' | '18:9';
  extendY: boolean;
  unchangedSprites: boolean;
  noVisualFixes: boolean;

  // ─── Graphics ───
  windowScale: number; // 1-5
  fullscreen: 0 | 1 | 2; // 0=windowed, 1=borderless, 2=exclusive
  newRenderer: boolean;
  enhancedMode7: boolean;
  noSpriteLimits: boolean;
  ignoreAspectRatio: boolean;
  linearFiltering: boolean;
  dimFlashes: boolean;
  outputMethod: 'SDL' | 'SDL-Software' | 'OpenGL' | 'OpenGL ES';

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
  audioFreq: number;
  audioChannels: 1 | 2;
  audioSamples: number;
  enableMSU: 'false' | 'true' | 'deluxe' | 'opuz' | 'deluxe-opuz';
  resumeMSU: boolean;
  msuVolume: number; // 0-100
}
