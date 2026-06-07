/* @layer bridge-wasm @kind logic */
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
import { buildFeatureFlags, buildPpuFlags } from './live-settings-flags';
import { LIVE_SETTINGS } from './live-settings-keys';

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

const pushLiveSettings = (settings: GameSettings): boolean => {
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
};

const reassertBackdropBlack = (): void => {
  const mod = getModule();
  if (!mod) return;
  try {
    mod.ccall('WasmSetForceBackdropBlack', null, ['number'], [lastBackdropBlack ? 1 : 0]);
  } catch { /* ignore — WASM may not have this export */ }
};

const reassertHudHidden = (): void => {
  const mod = getModule();
  if (!mod) return;
  try {
    mod.ccall('WasmSetHudHidden', null, ['number'], [lastHudHidden ? 1 : 0]);
  } catch { /* ignore — WASM may not have this export */ }
};

const reassertPauseHidden = (): void => {
  const mod = getModule();
  if (!mod) return;
  try {
    mod.ccall('WasmSetPauseHidden', null, ['number'], [lastPauseHidden ? 1 : 0]);
  } catch { /* ignore — WASM may not have this export */ }
};

const reassertVolumes = (): void => {
  const mod = getModule();
  if (!mod) return;
  setMasterVolume(lastMasterVolume);
  try { mod.ccall('WasmSetAppMasterVolume', null, ['number'], [Math.round(lastMasterVolume * 1.28)]); } catch {}
  try { mod.ccall('WasmSetMusicVolume', null, ['number'], [lastMusicVol]); } catch {}
  try { mod.ccall('WasmSetSfxVolume', null, ['number'], [lastSfxVol]); } catch {}
};

const requiresRestart = (changedKeys: (keyof GameSettings)[]): boolean => {
  return changedKeys.some((k) => !LIVE_SETTINGS.has(k));
};

const primeLiveSettings = (settings: GameSettings): void => {
  lastBackdropBlack = !!settings.forceBackdropBlack;
  const hideHud = settings.hudMode === 'enhanced' && settings.hudEnhancedParts.includes('main');
  lastHudHidden = hideHud;
  const hidePause = settings.hudMode === 'enhanced' && settings.hudEnhancedParts.includes('pause');
  lastPauseHidden = hidePause;
  lastMasterVolume = settings.masterVolume;
  lastMusicVol = settings.musicMuted ? 0 : Math.round(settings.musicVolume * 1.28);
  lastSfxVol = settings.sfxMuted ? 0 : Math.round(settings.sfxVolume * 1.28);
};

export { LIVE_SETTINGS, pushLiveSettings, reassertBackdropBlack, reassertHudHidden, reassertPauseHidden, reassertVolumes, requiresRestart, primeLiveSettings };
