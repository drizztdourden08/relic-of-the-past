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
import { updateHapticBridgeSettings, updateHapticsProfileEnabled } from '../input/haptic-bridge';
import { DEFAULT_SETTINGS } from './settings';
import { log } from '../log-bus';
import { buildFeatureFlags, buildFeatureWord3, buildPpuFlags, buildFeatureWords } from './live-settings-flags';
import { LIVE_SETTINGS } from './live-settings-keys';

// Track the last-pushed forceBackdropBlack value so we can re-assert after state loads
let lastBackdropBlack = false;
// Frame pacing mode. The core boots on the timer schedule and has no INI key for this, so the
// startup re-assert is what actually applies the profile's choice — not just a post-load repair.
let lastVsync = false;
// Track the last-pushed hudHidden value so we can re-assert after state loads
let lastHudHidden = false;
// Track the last-pushed pauseHidden value so we can re-assert after state loads
let lastPauseHidden = false;
// Track the last-pushed volume values so we can re-assert after state loads
let lastMasterVolume = 100;
let lastMusicVol = 128; // 0-128 WASM scale
let lastSfxVol = 128;  // 0-128 WASM scale
// Last full settings pushed, so a live override (e.g. the simulator's auto-skip-dialog force) can
// recompute and re-push the features word without the caller holding the settings object.
let lastSettings: GameSettings | null = null;

const pushLiveSettings = (settings: GameSettings): boolean => {
  const mod = getModule();
  if (!mod) {
    log.app('Live settings: no WASM module available', 'warn');
    return false;
  }

  try {
    lastSettings = settings;
    const features = buildFeatureFlags(settings);
    mod.ccall('WasmSetFeatures', null, ['number'], [features]);

    // Split bug-fix toggles ride in two more bitmask words (guarded: older WASM lacks these exports).
    const { features1, features2 } = buildFeatureWords(settings);
    try { mod.ccall('WasmSetFeatures1', null, ['number'], [features1]); } catch { /* WASM not rebuilt yet */ }
    try { mod.ccall('WasmSetFeatures2', null, ['number'], [features2]); } catch { /* WASM not rebuilt yet */ }

    // Cheat gating word (features3) — guarded: older WASM lacks WasmSetGateWord.
    try { mod.ccall('WasmSetGateWord', null, ['number', 'number'], [3, buildFeatureWord3(settings)]); } catch { /* WASM not rebuilt yet */ }

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

    // Frame pacing (guard: function may not exist in older WASM builds)
    try {
      lastVsync = !!settings.vsync;
      mod.ccall('WasmSetVsync', null, ['number'], [settings.vsync ? 1 : 0]);
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
    updateHapticsProfileEnabled(settings.hapticsEnabled ?? DEFAULT_SETTINGS.hapticsEnabled);

    log.app(`Live settings pushed — features: 0x${features.toString(16)}, ppu: 0x${ppuFlags.toString(16)}`);
    return true;
  } catch (e) {
    log.app(`Live settings push failed: ${e}`, 'error');
    return false;
  }
};

/** Guarded one-arg ccall — no-op if the module or export is unavailable. */
const tryVoidCcall = (fn: string, value: number): void => {
  const mod = getModule();
  if (!mod) return;
  try { mod.ccall(fn, null, ['number'], [value]); } catch { /* ignore — WASM may not have this export */ }
};

const reassertBackdropBlack = (): void => tryVoidCcall('WasmSetForceBackdropBlack', lastBackdropBlack ? 1 : 0);

const reassertVsync = (): void => tryVoidCcall('WasmSetVsync', lastVsync ? 1 : 0);

const reassertHudHidden = (): void => tryVoidCcall('WasmSetHudHidden', lastHudHidden ? 1 : 0);

const reassertPauseHidden = (): void => tryVoidCcall('WasmSetPauseHidden', lastPauseHidden ? 1 : 0);

const reassertVolumes = (): void => {
  if (!getModule()) return;
  setMasterVolume(lastMasterVolume);
  tryVoidCcall('WasmSetAppMasterVolume', Math.round(lastMasterVolume * 1.28));
  tryVoidCcall('WasmSetMusicVolume', lastMusicVol);
  tryVoidCcall('WasmSetSfxVolume', lastSfxVol);
};

/**
 * Push all three feature words from the last primed/pushed settings.
 *
 * These words have no INI path (config.c parses features0 only), so the core starts with all three at
 * zero and they only ever become non-zero through a ccall. Priming a profile seeds the JS side but
 * cannot ccall, because the module is not running yet; so without this the granular fix words stayed
 * zero for a whole session unless a settings change happened to push them.
 */
const reassertFeatureWords = (): void => {
  const mod = getModule();
  // Without primed settings there is nothing truthful to send: features0 already carries the boot INI
  // values, and rebuilding it from DEFAULT_SETTINGS would push a 4:3 non-extended word over them, which
  // drops flags the INI legitimately set. features1/features2 have no INI path, so skipping costs nothing
  // that the next real push will not supply.
  if (!mod || !lastSettings) return;
  const settings = lastSettings;
  const { features1, features2 } = buildFeatureWords(settings);
  tryVoidCcall('WasmSetFeatures', buildFeatureFlags(settings));
  tryVoidCcall('WasmSetFeatures1', features1);
  tryVoidCcall('WasmSetFeatures2', features2);
};

/** Re-assert every live flag after a save-state load clobbers WRAM. */
/**
 * Recompute and re-push only the gate word (features3). Lets a live override (e.g. the
 * randomizer arming its item-override table) reach the core immediately, the same way
 * reassertFeatureFlags does for word 0.
 */
const reassertGateWord3 = (): void => {
  const mod = getModule();
  if (!mod) return;
  const settings = lastSettings ?? DEFAULT_SETTINGS;
  try { mod.ccall('WasmSetGateWord', null, ['number', 'number'], [3, buildFeatureWord3(settings)]); } catch { /* WASM not rebuilt yet */ }
};

const reassertLiveFlagsAfterLoad = (): void => {
  // features1 and features2 only ever reached the core through this live path, so a state load that
  // reasserted the flags without them left every feature in those two words off until a setting was
  // touched. Push all three words, then word 3 below.
  reassertFeatureWords();
  // Gate words first: the C boot seed (emscripten_main.c) rebuilds word 3 from the INI, which only
  // carries the cheat bits, so it lands AFTER whatever pushLiveSettings pushed and silently drops
  // hudOverride/trackerNotifications/playerSpriteOverride. Re-pushing the renderer's value here makes
  // the TS side authoritative again, and it has to happen before the hide reasserts below so the
  // requests they make are already permitted when the core reconciles them.
  reassertGateWord3();
  reassertBackdropBlack();
  reassertVsync();
  reassertHudHidden();
  reassertPauseHidden();
  reassertVolumes();
};

/**
 * Recompute and re-push only the features word. Lets a live feature override
 * (e.g. the simulator forcing auto-skip-dialog on) reach the core immediately.
 * Falls back to DEFAULT_SETTINGS when no settings have been pushed/primed yet, so
 * the override still reaches the core on a fresh session (buildFeatureFlags ORs
 * the override in regardless of the base settings).
 */
const reassertFeatureFlags = (): void => {
  const mod = getModule();
  if (!mod) return;
  const settings = lastSettings ?? DEFAULT_SETTINGS;
  try { mod.ccall('WasmSetFeatures', null, ['number'], [buildFeatureFlags(settings)]); } catch { /* ignore */ }
};

const primeLiveSettings = (settings: GameSettings): void => {
  // Seed lastSettings so a live override (simulator auto-skip-dialog) can recompute and re-push
  // the features word even before the user changes a setting to trigger a full pushLiveSettings.
  lastSettings = settings;
  lastBackdropBlack = !!settings.forceBackdropBlack;
  lastVsync = !!settings.vsync;
  const hideHud = settings.hudMode === 'enhanced' && settings.hudEnhancedParts.includes('main');
  lastHudHidden = hideHud;
  const hidePause = settings.hudMode === 'enhanced' && settings.hudEnhancedParts.includes('pause');
  lastPauseHidden = hidePause;
  lastMasterVolume = settings.masterVolume;
  lastMusicVol = settings.musicMuted ? 0 : Math.round(settings.musicVolume * 1.28);
  lastSfxVol = settings.sfxMuted ? 0 : Math.round(settings.sfxVolume * 1.28);
};

export { LIVE_SETTINGS, pushLiveSettings, reassertFeatureWords, reassertBackdropBlack, reassertVsync, reassertHudHidden, reassertPauseHidden, reassertVolumes, reassertLiveFlagsAfterLoad, reassertFeatureFlags, reassertGateWord3, primeLiveSettings };
