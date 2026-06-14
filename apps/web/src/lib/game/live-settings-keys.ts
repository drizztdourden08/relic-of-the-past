/* @layer bridge-wasm @kind data */
/** Settings keys that can be live-updated while the game runs (no restart). */
import type { GameSettings } from '@shared/types/settings';

const LIVE_SETTINGS: ReadonlySet<keyof GameSettings> = new Set([
  // Feature flags (synced every frame via g_wanted_zelda_features)
  'itemSwitchLR',
  'itemSwitchLRLimit',
  'turnWhileDashing',
  'mirrorToDarkworld',
  'collectItemsWithSword',
  'breakPotsWithSword',
  'disableLowHealthBeep',
  'skipIntroOnKeypress',
  'showMaxItemsInYellow',
  'moreActiveBombs',
  'carryMoreRupees',
  'miscBugFixes',
  'gameChangingBugFixes',
  'cancelBirdTravel',
  'dimFlashes',
  'disableTelepathy',
  // PPU flags (read every frame)
  'noSpriteLimits',
  'newRenderer',
  'enhancedMode7',
  // Window settings (Electron-managed, no WASM restart needed)
  'windowMode',
  'viewportConstraint',
  // Audio volume (Web Audio gain, no restart needed)
  'masterVolume',
  // Sub-volumes (WASM DSP-level, no restart needed)
  'musicVolume',
  'musicMuted',
  'sfxVolume',
  'sfxMuted',
  // FPS display (toggled via WasmSetDisplayPerf)
  'displayPerfInTitle',
  // Enhanced save slot settings (JS-only, no WASM restart needed)
  'enhancedSaveSlotShortcut',
  'saveHoldDuration',
  // Controls (JS-only)
  'functionMappings',
  'activeInputProfileId',
  // Edge effect (React prop, no WASM restart needed)
  'overworldEdgeEffect',
  // Backdrop color (WASM flag, pushed live)
  'forceBackdropBlack',
  // HUD settings (React-only, no WASM restart needed)
  'hudMode',
  'hudStyle',
  'hudRatio',
  'hudEnhancedParts',
  'hudHeartMode',
  'hudMagicMode',
  'hudCountLayout',
  'hudPauseStyle',
  'hudPauseHighlight',
  // Notification settings (React-only, no WASM restart needed)
  'showScreenNotification',
  'showTransitionNotification',
  // Haptics (JS-only, no WASM restart needed)
  'haptics',
]);

export { LIVE_SETTINGS };
