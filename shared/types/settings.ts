/* @layer shared-types @kind logic */
import type { FunctionMapping } from './controls';

/** Haptic feedback configuration — controls vibration/rumble for game events */
interface HapticSettings {
  enabled: boolean;
  intensity: number; // 0–100 global multiplier
  swordSwing: boolean;
  swordHitEnemy: boolean;
  swordClink: boolean;
  damageTaken: boolean;
  itemUse: boolean;
  dashVibration: boolean;
  environmentalEffects: boolean;
}

/** Per-profile game settings — mirrors zelda3 config.h / zelda3.ini fields */
interface GameSettings {
  // ─── General ───
  autosave: boolean; // Legacy: C-level autosave (slot 0 save/restore) — kept for INI compat
  autoSaveEnabled: boolean;
  autoSaveIntervalSeconds: number; // 60-1800, default 300
  autoSaveMaxEntries: number; // 1-20, default 5
  saveOnQuit: boolean;
  displayPerfInTitle: boolean;
  disableFrameDelay: boolean;

  // ─── Aspect Ratio & Display ───
  // 'auto' = current app viewport (notch-aware); 'screen' = full device screen; a preset string
  // ('4:3'…'16:10') = fixed; 'custom' = the W:H below. Re-resolved on every game start.
  aspectRatio: 'auto' | 'screen' | '4:3' | '3:2' | '16:9' | '16:10' | 'custom';
  customAspectW: number; // ratio width when aspectRatio === 'custom'; 0 = auto-detect from screen
  customAspectH: number; // ratio height; 0 = auto-detect
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

  // ─── Mobile display ───
  // true (default): render under the camera cutout (full-bleed). false: keep UI +
  // canvas inside the usable screen. Renderer-only (not serialized to the INI).
  renderIntoNotch: boolean;

  // ─── Gameplay features ───
  itemSwitchLR: boolean;
  itemSwitchLRLimit: boolean;
  turnWhileDashing: boolean;
  mirrorToDarkworld: boolean;
  collectItemsWithSword: boolean;
  breakPotsWithSword: boolean;
  disableLowHealthBeep: boolean;
  skipIntroOnKeypress: boolean;
  disableTelepathy: boolean;
  showMaxItemsInYellow: boolean;
  moreActiveBombs: boolean;
  carryMoreRupees: boolean;
  miscBugFixes: boolean;
  gameChangingBugFixes: boolean;
  cancelBirdTravel: boolean;

  // ─── Audio ───
  enableAudio: boolean;
  masterVolume: number; // 0-100
  musicVolume: number; // 0-100
  musicMuted: boolean;
  sfxVolume: number; // 0-100
  sfxMuted: boolean;
  audioFreq: number;
  audioChannels: 1 | 2;
  audioSamples: number;
  enableMSU: 'false' | 'true' | 'deluxe' | 'opuz' | 'deluxe-opuz';
  resumeMSU: boolean;
  msuVolume: number; // 0-100

  // ─── Post-Processing ───
  overworldEdgeEffect: boolean;
  postProcessingShadows: boolean;
  forceBackdropBlack: boolean;

  // ─── HUD ───
  hudMode: 'original' | 'enhanced';
  hudStyle: 'vanilla' | 'modern';
  hudRatio: 'match' | '4:3' | '3:2' | '16:9' | '16:10' | 'custom';
  customHudAspectW: number; // ratio width when hudRatio === 'custom'; 0 = auto-detect from screen
  customHudAspectH: number; // ratio height; 0 = auto-detect
  hudEnhancedParts: ('main' | 'pause')[];
  hudHeartMode: 'original' | 'smooth';
  hudMagicMode: 'original' | 'accurate';
  hudCountLayout: 'centered' | 'original';
  hudPauseStyle: 'vanilla' | 'enhanced';
  hudPauseHighlight: 'box' | 'glow' | 'none';

  // ─── Controls ───
  activeInputProfileId: string | null;
  functionMappings?: FunctionMapping[];
  enhancedSaveSlotShortcut: boolean;
  saveHoldDuration: number; // seconds, 1-5

  // ─── Notifications ───
  showScreenNotification: boolean;
  showTransitionNotification: boolean;

  // ─── Haptics ───
  haptics: HapticSettings;
}

export type { GameSettings, HapticSettings };
