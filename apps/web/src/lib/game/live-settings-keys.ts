/* @layer bridge-wasm @kind data */
/** Settings keys that can be live-updated while the game runs (no restart). */
import type { GameSettings } from '@shared/types/settings';
import { ONLINE_NOTICE_SETTING_KEYS } from '@shared/randomizer/archipelago/online-notice-settings';
import { QUIET_RECEIPT_KEY, QUIET_RECEIPT_KINDS } from '@shared/game/quiet-receipts';

const LIVE_SETTINGS: ReadonlySet<keyof GameSettings> = new Set([
  // Feature flags (synced every frame via g_wanted_zelda_features)
  'turnWhileDashing',
  'allowDiving',
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
  // Second-cartridge content (gates the extra dungeon's overworld entrance)
  'extraDungeon',
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
  'widescreenSprites',
  'widescreenVisualFixes',
  // Granular bug-fix toggles + new gameplay flags (synced every frame via features1/features2)
  'bugFixToggles',
  'autoSkipDialog',
  'prefillFileName',
  // World-item presentation (synced every frame via features3, same path as cheatsEnabled)
  'coloredRupees',
  'itemSheen',
  // The archery host's refusal (features3, same path again)
  'archeryNeedsBow',
  // Dialog pacing (pushed as plain values, gated by the DialogControls bit in features3)
  'dialogSpeed',
  'dialogHoldSpeed',
  'dialogHoldToAccelerate',
  'dialogFillOnB',
  'dialogTypewriter',
  // Dialog box look (React overlay, plus one hidden flag the core reads every frame)
  'dialogBox',
  'dialogFont',
  'dialogFontScale',
  'dialogInkColor',
  'dialogStrokeColor',
  'dialogStrokeWidth',
  // Randomizer message highlights (the host box's colours, and two words the core draws with)
  'hudHighlightPrimary',
  'hudHighlightSecondary',
  'dialogBoxOpacity',
  'dialogButtonPrompts',
  'dialogFloatingGround',
  'dialogIntroTelepathyGround',
  'dialogGroundFade',
  'dialogBoxFit',
  'dialogBorder',
  'dialogBorderThickness',
  'dialogBorderColor',
  'dialogCorner',
  'dialogCornerMark',
  'dialogCornerMarkAngle',
  'dialogTexture',
  'dialogTextureColor',
  'dialogTextureOpacity',
  'dialogTextureAnimation',
  'dialogTextureSpeed',
  'dialogTextureScale',
  'dialogTextureDensity',
  'dialogTextureScatter',
  'dialogGroundColor',
  // Title screen (React overlay, plus the hide bit in features2 and one wanted flag the core reconciles)
  'titleScreen',
  'titleMotion',
  'titleFollowsProgress',
  'titleSword',
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
  // Turbo speed, pushed via WasmSetTurboSpeed; a plain pacing global, read on every tick
  'turboEnabled',
  'turboSpeed',
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
  // The per-slot assignment table and the classic-only map shortcut. (The scheme itself is derived
  // from hudStyle, listed below, and reaches the core as the gate-word bits features2
  // HostMenu/ModernControls, pushed every frame.) The assignments never leave the host at all, so
  // neither of these needs a restart.
  'modernScheme',
  'mapOnSelect',
  // Edge effect (React prop, no WASM restart needed)
  'overworldEdgeEffect',
  // Space beyond a room's walls (WASM request, pushed live)
  'hideSpaceBeyondWalls',
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
  'hudCountdownStyle',
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
  // Online notice toasts: the toast stack reads them as each notice arrives
  ...ONLINE_NOTICE_SETTING_KEYS,
  // Quiet receipts: gate word 5 follows them on every push, and each delivery reads them when queued
  ...QUIET_RECEIPT_KINDS.map((kind) => QUIET_RECEIPT_KEY[kind]),
]);

export { LIVE_SETTINGS };
