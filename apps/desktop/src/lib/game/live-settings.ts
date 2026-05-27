/**
 * Live Settings — push settings changes to the running WASM module.
 *
 * Some settings can be changed while the game is running:
 * - Feature flags (gameplay toggles) → written to g_wanted_zelda_features
 * - PPU render flags (noSpriteLimits, newRenderer, enhancedMode7) → written to g_ppu_render_flags
 *
 * Other settings require a game restart:
 * - Aspect ratio, extend_y (baked into canvas/texture dimensions)
 * - Audio settings (SDL audio device opened once)
 * - Linear filtering, ignore aspect ratio (renderer init)
 */

import type { GameSettings } from '@shared/types/settings';
import { getModule } from './wasm-bridge';
import { setMasterVolume } from './audio-volume';
import { updateHapticBridgeSettings } from '../input/haptic-bridge';
import { DEFAULT_SETTINGS } from './settings';
import { log } from '../log-bus';

// Track the last-pushed forceBackdropBlack value so we can re-assert after state loads
let lastBackdropBlack = false;
// Track the last-pushed hudHidden value so we can re-assert after state loads
let lastHudHidden = false;
// Track the last-pushed pauseHidden value so we can re-assert after state loads
let lastPauseHidden = false;
// Track the last-pushed volume values so we can re-assert after state loads
let lastMasterVolume = 100;
let lastMusicVol = 128; // 0-128 WASM scale
let lastSfxVol = 128;  // 0-128 WASM scale

// Feature flag enum values — must match features.h
const FEATURE_FLAGS = {
  extendScreen64:         1,
  switchLR:               2,
  turnWhileDashing:       4,
  mirrorToDarkworld:      8,
  collectItemsWithSword:  16,
  breakPotsWithSword:     32,
  disableLowHealthBeep:   64,
  skipIntroOnKeypress:    128,
  showMaxItemsInYellow:   256,
  moreActiveBombs:        512,
  widescreenVisualFixes:  1024,
  carryMoreRupees:        2048,
  miscBugFixes:           4096,
  cancelBirdTravel:       8192,
  gameChangingBugFixes:   16384,
  switchLRLimit:          32768,
  dimFlashes:             65536,
  disableTelepathy:       131072,
} as const;

// PPU render flag values — must match ppu.h
const PPU_FLAGS = {
  newRenderer:    1,
  mode7_4x4:     2,
  height240:     4,
  noSpriteLimits: 8,
} as const;

/** Build features0 bitmask from GameSettings. */
function buildFeatureFlags(s: GameSettings): number {
  let flags = 0;
  if (s.aspectRatio !== '4:3' && !s.unchangedSprites) flags |= FEATURE_FLAGS.extendScreen64;
  if (s.aspectRatio !== '4:3' && !s.noVisualFixes) flags |= FEATURE_FLAGS.widescreenVisualFixes;
  if (s.itemSwitchLR) flags |= FEATURE_FLAGS.switchLR;
  if (s.itemSwitchLRLimit) flags |= FEATURE_FLAGS.switchLRLimit;
  if (s.turnWhileDashing) flags |= FEATURE_FLAGS.turnWhileDashing;
  if (s.mirrorToDarkworld) flags |= FEATURE_FLAGS.mirrorToDarkworld;
  if (s.collectItemsWithSword) flags |= FEATURE_FLAGS.collectItemsWithSword;
  if (s.breakPotsWithSword) flags |= FEATURE_FLAGS.breakPotsWithSword;
  if (s.disableLowHealthBeep) flags |= FEATURE_FLAGS.disableLowHealthBeep;
  if (s.skipIntroOnKeypress) flags |= FEATURE_FLAGS.skipIntroOnKeypress;
  if (s.showMaxItemsInYellow) flags |= FEATURE_FLAGS.showMaxItemsInYellow;
  if (s.moreActiveBombs) flags |= FEATURE_FLAGS.moreActiveBombs;
  if (s.carryMoreRupees) flags |= FEATURE_FLAGS.carryMoreRupees;
  if (s.miscBugFixes) flags |= FEATURE_FLAGS.miscBugFixes;
  if (s.gameChangingBugFixes) flags |= FEATURE_FLAGS.gameChangingBugFixes;
  if (s.cancelBirdTravel) flags |= FEATURE_FLAGS.cancelBirdTravel;
  if (s.dimFlashes) flags |= FEATURE_FLAGS.dimFlashes;
  if (s.disableTelepathy) flags |= FEATURE_FLAGS.disableTelepathy;
  return flags;
}

/** Build PPU render flags from GameSettings. */
function buildPpuFlags(s: GameSettings): number {
  let flags = 0;
  if (s.newRenderer) flags |= PPU_FLAGS.newRenderer;
  if (s.enhancedMode7) flags |= PPU_FLAGS.mode7_4x4;
  if (s.extendY) flags |= PPU_FLAGS.height240;
  if (s.noSpriteLimits) flags |= PPU_FLAGS.noSpriteLimits;
  return flags;
}

/** Settings keys that can be live-updated while the game runs. */
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
  'showRegionNotification',
  'showTransitionNotification',
  // Haptics (JS-only, no WASM restart needed)
  'haptics',
]);

/** Push live-updatable settings to the running WASM module. Returns true if successful. */
function pushLiveSettings(settings: GameSettings): boolean {
  const mod = getModule();
  if (!mod) {
    log.app('Live settings: no WASM module available', 'warn');
    return false;
  }

  try {
    const features = buildFeatureFlags(settings);
    mod.ccall('WasmSetFeatures', null, ['number'], [features]);

    const ppuFlags = buildPpuFlags(settings);
    mod.ccall('WasmSetPpuRenderFlags', null, ['number'], [ppuFlags]);

    // Master volume via Web Audio GainNode + WASM SDL mixer (belt-and-suspenders)
    setMasterVolume(settings.masterVolume);
    lastMasterVolume = settings.masterVolume;
    try {
      const masterWasm = Math.round(settings.masterVolume * 1.28); // 0-100 → 0-128
      mod.ccall('WasmSetAppMasterVolume', null, ['number'], [masterWasm]);
    } catch { /* WASM not rebuilt yet */ }

    // Sub-volumes via WASM DSP (0-100 → 0-128 scale)
    const musicVol = settings.musicMuted ? 0 : Math.round(settings.musicVolume * 1.28);
    const sfxVol = settings.sfxMuted ? 0 : Math.round(settings.sfxVolume * 1.28);
    try { mod.ccall('WasmSetMusicVolume', null, ['number'], [musicVol]); lastMusicVol = musicVol; } catch {}
    try { mod.ccall('WasmSetSfxVolume', null, ['number'], [sfxVol]); lastSfxVol = sfxVol; } catch {}

    // FPS display toggle (guard: function may not exist in older WASM builds)
    try {
      mod.ccall('WasmSetDisplayPerf', null, ['number'], [settings.displayPerfInTitle ? 1 : 0]);
    } catch { /* WASM not rebuilt yet */ }

    // Force backdrop to black (guard: function may not exist in older WASM builds)
    try {
      lastBackdropBlack = !!settings.forceBackdropBlack;
      mod.ccall('WasmSetForceBackdropBlack', null, ['number'], [settings.forceBackdropBlack ? 1 : 0]);
    } catch { /* WASM not rebuilt yet */ }

    // Hide native gameplay HUD when enhanced overlay is active
    try {
      const hideHud = settings.hudMode === 'enhanced' && settings.hudEnhancedParts.includes('main');
      lastHudHidden = hideHud;
      mod.ccall('WasmSetHudHidden', null, ['number'], [hideHud ? 1 : 0]);
    } catch { /* WASM not rebuilt yet */ }

    // Hide native pause menu when enhanced pause overlay is active
    try {
      const hidePause = settings.hudMode === 'enhanced' && settings.hudEnhancedParts.includes('pause');
      lastPauseHidden = hidePause;
      mod.ccall('WasmSetPauseHidden', null, ['number'], [hidePause ? 1 : 0]);
    } catch { /* WASM not rebuilt yet */ }

    // Haptic feedback settings (JS-only, no WASM needed)
    updateHapticBridgeSettings(settings.haptics ?? DEFAULT_SETTINGS.haptics);

    log.app(`Live settings pushed — features: 0x${features.toString(16)}, ppu: 0x${ppuFlags.toString(16)}`);
    return true;
  } catch (e) {
    log.app(`Live settings push failed: ${e}`, 'error');
    return false;
  }
}

/**
 * Re-assert the current forceBackdropBlack state to WASM.
 * Called after state loads to ensure the flag isn't lost.
 * Uses the last value pushed via pushLiveSettings as source of truth.
 */
function reassertBackdropBlack(): void {
  const mod = getModule();
  if (!mod) return;
  try {
    mod.ccall('WasmSetForceBackdropBlack', null, ['number'], [lastBackdropBlack ? 1 : 0]);
  } catch { /* ignore — WASM may not have this export */ }
}

/**
 * Re-assert the current hudHidden state to WASM.
 * Called after state loads to ensure the flag isn't lost.
 */
function reassertHudHidden(): void {
  const mod = getModule();
  if (!mod) return;
  try {
    mod.ccall('WasmSetHudHidden', null, ['number'], [lastHudHidden ? 1 : 0]);
  } catch { /* ignore — WASM may not have this export */ }
}

/**
 * Re-assert the current pauseHidden state to WASM.
 * Called after state loads to ensure the flag isn't lost.
 */
function reassertPauseHidden(): void {
  const mod = getModule();
  if (!mod) return;
  try {
    mod.ccall('WasmSetPauseHidden', null, ['number'], [lastPauseHidden ? 1 : 0]);
  } catch { /* ignore — WASM may not have this export */ }
}

/**
 * Re-assert all volume settings.
 * Called after state loads and on initial game start to ensure volumes are correct.
 */
function reassertVolumes(): void {
  const mod = getModule();
  if (!mod) return;
  setMasterVolume(lastMasterVolume);
  try { mod.ccall('WasmSetAppMasterVolume', null, ['number'], [Math.round(lastMasterVolume * 1.28)]); } catch {}
  try { mod.ccall('WasmSetMusicVolume', null, ['number'], [lastMusicVol]); } catch {}
  try { mod.ccall('WasmSetSfxVolume', null, ['number'], [lastSfxVol]); } catch {}
}

/** Check if a setting change requires a game restart (i.e. it's NOT live-updatable). */
function requiresRestart(changedKeys: (keyof GameSettings)[]): boolean {
  return changedKeys.some((k) => !LIVE_SETTINGS.has(k));
}

/**
 * Prime tracked live-setting values from known-good settings.
 * Call this early (e.g. in onProfileLoaded) so reassert* functions
 * have correct values even if pushLiveSettings hasn't fired yet.
 */
function primeLiveSettings(settings: GameSettings): void {
  lastBackdropBlack = !!settings.forceBackdropBlack;
  const hideHud = settings.hudMode === 'enhanced' && settings.hudEnhancedParts.includes('main');
  lastHudHidden = hideHud;
  const hidePause = settings.hudMode === 'enhanced' && settings.hudEnhancedParts.includes('pause');
  lastPauseHidden = hidePause;
  lastMasterVolume = settings.masterVolume;
  lastMusicVol = settings.musicMuted ? 0 : Math.round(settings.musicVolume * 1.28);
  lastSfxVol = settings.sfxMuted ? 0 : Math.round(settings.sfxVolume * 1.28);
}

export { LIVE_SETTINGS, pushLiveSettings, reassertBackdropBlack, reassertHudHidden, reassertPauseHidden, reassertVolumes, requiresRestart, primeLiveSettings };
