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
import { log } from '../log-bus';

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
export const LIVE_SETTINGS: ReadonlySet<keyof GameSettings> = new Set([
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
  // PPU flags (read every frame)
  'noSpriteLimits',
  'newRenderer',
  'enhancedMode7',
  // Window settings (Electron-managed, no WASM restart needed)
  'windowMode',
  'viewportConstraint',
  // Audio volume (Web Audio gain, no restart needed)
  'masterVolume',
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
]);

/** Push live-updatable settings to the running WASM module. Returns true if successful. */
export function pushLiveSettings(settings: GameSettings): boolean {
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

    // Master volume via Web Audio GainNode
    setMasterVolume(settings.masterVolume);

    // FPS display toggle (guard: function may not exist in older WASM builds)
    try {
      mod.ccall('WasmSetDisplayPerf', null, ['number'], [settings.displayPerfInTitle ? 1 : 0]);
    } catch { /* WASM not rebuilt yet */ }

    // Force backdrop to black (guard: function may not exist in older WASM builds)
    try {
      mod.ccall('WasmSetForceBackdropBlack', null, ['number'], [settings.forceBackdropBlack ? 1 : 0]);
    } catch { /* WASM not rebuilt yet */ }

    log.app(`Live settings pushed — features: 0x${features.toString(16)}, ppu: 0x${ppuFlags.toString(16)}`);
    return true;
  } catch (e) {
    log.app(`Live settings push failed: ${e}`, 'error');
    return false;
  }
}

/** Check if a setting change requires a game restart (i.e. it's NOT live-updatable). */
export function requiresRestart(changedKeys: (keyof GameSettings)[]): boolean {
  return changedKeys.some((k) => !LIVE_SETTINGS.has(k));
}
