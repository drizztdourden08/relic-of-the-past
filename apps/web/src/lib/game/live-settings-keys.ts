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
  // restart). The geometry settings beside them (extendedRendering, aspectRatio, ultrawideRendering,
  // tallRendering, extendY) are baked at init and are deliberately NOT here.
  'cameraLockToViewport',
  'smoothTransitions',
  'widescreenPlayArea',
  'offscreenAI',
  // Deprecated migration source for offscreenAI, never written any more; kept live so any
  // stray legacy write still applies without forcing a restart.
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
  // Canvas fit is recomputed from a React prop, so no WASM restart is needed
  'pixelPerfect',
  // Frame pacing, swapped via WasmSetVsync because the main loop's schedule can change mid-run
  'vsync',
  // Audio volume (Web Audio gain, no restart needed)
  'masterVolume',
  // Sub-volumes (WASM DSP-level, no restart needed)
  'musicVolume',
  'musicMuted',
  'sfxVolume',
  'sfxMuted',
  // Ambience is app-mixed only (msuSyncVolume on every push) because the sound chip has no ambient split
  'ambientVolume',
  'ambientMuted',
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
  // Developer tools master gate (synced every frame via features0, same path as haptics)
  'developerToolsEnabled',
  // Cheat gating (synced every frame via features3, same path as developerToolsEnabled)
  'cheatsEnabled',
  // vanillaSafe is deliberately NOT here: its gate-word masking is instant regardless (pushLiveSettings
  // runs on every change), but flipping it also has to correct aspectRatio/extendY and MSU, which are
  // restart-only. Leaving it off makes the toggle surface the restart toast.
  // Player sprite sheet (swapped in place via WasmApplyPlayerSpriteFile)
  'linkSprite',
  // Replacement-music position handling. Both are read on every music event, not captured at
  // session start, so a change applies to the very next one.
  'resumeMSU',
  'resetMSUAtTitle',
]);

export { LIVE_SETTINGS };
