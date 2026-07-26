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
  // Extended-rendering feature bits that are pure per-frame flags (no buffer-geometry change, so no
  // restart). The geometry settings they sit beside — extendedRendering, aspectRatio, ultrawideRendering,
  // tallRendering, extendY — are baked at init and are deliberately NOT here.
  'cameraLockToViewport',
  'smoothTransitions',
  'pauseOffscreenAI',
  'widescreenSprites',
  'widescreenVisualFixes',
  // Granular bug-fix toggles + new gameplay flags (synced every frame via features1/features2)
  'bugFixToggles',
  'inventoryReorder',
  'secondaryItemSlots',
  'autoSkipDialog',
  // Per-group volume enable gate (DSP flag pushed live)
  'perGroupVolume',
  // Window settings (Electron-managed, no WASM restart needed)
  'windowMode',
  'viewportConstraint',
  // Host-side display switch: pushed on change, applied on the next fullscreen transition
  'syncedRefreshRate',
  'syncedRefreshRateHz',
  // Canvas fit is recomputed from a React prop — no WASM restart needed
  'pixelPerfect',
  // Frame pacing (swapped via WasmSetVsync — the main loop's schedule can change mid-run)
  'vsync',
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
  'customHudAspectW',
  'customHudAspectH',
  'hudEnhancedParts',
  'hudHeartMode',
  'hudMagicMode',
  'hudCountLayout',
  'hudPauseStyle',
  'hudPauseHighlight',
  // Haptics (JS-only, no WASM restart needed)
  'haptics',
  // Player sprite sheet (swapped in place via WasmApplyPlayerSpriteFile)
  'linkSprite',
]);

export { LIVE_SETTINGS };
