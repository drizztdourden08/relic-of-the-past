/* @layer bridge-wasm @kind logic */
// Live-pushable: feature flags (g_wanted_zelda_features), PPU render flags (g_ppu_render_flags).
// Restart-only: aspect ratio / extend_y (texture size), audio (SDL device opened once),
// linear filtering / ignore aspect ratio (renderer init).

import type { GameSettings } from '@shared/types/settings';
import { getModule } from './wasm-bridge';
import { msuSyncVolume } from './msu-session';
import { setMasterVolume } from './audio-volume';
import { updateHapticBridgeSettings, updateHapticsProfileEnabled } from '../input/haptic-bridge';
import { DEFAULT_SETTINGS } from './settings';
import { log } from '../log-bus';
import { buildFeatureFlags, buildFeatureWord3, buildFeatureWords } from './live-settings-flags';
import { buildPpuFlags } from './live-settings-ppu-flags';
import { LIVE_SETTINGS } from './live-settings-keys';

// Track the last-pushed forceBackdropBlack value so we can re-assert after state loads
let lastBackdropBlack = false;
// Frame pacing mode. The core boots on the timer schedule and has no INI key for this, so the
// startup re-assert is what applies the profile's choice, not only a post-load repair.
let lastVsync = false;
// Track the last-pushed hudHidden value so we can re-assert after state loads
let lastHudHidden = false;
// Track the last-pushed pauseHidden value so we can re-assert after state loads
let lastPauseHidden = false;
// Track the last-pushed volume values so we can re-assert after state loads
let lastMasterVolume = 100;
let lastMusicVol = 128; // 0-128 WASM scale
let lastAmbientVol = 128; // 0-128 WASM scale
let lastSfxVol = 128;  // 0-128 WASM scale
// Last full settings pushed, so a live override (e.g. the simulator's auto-skip-dialog force) can
// recompute and re-push the features word without the caller holding the settings object.
let lastSettings: GameSettings | null = null;

/**
 * The settings as they are NOW, or null before anything was pushed. For long-lived closures that
 * must follow the sliders; a snapshot captured at profile load reads boot-time values forever,
 * which is how the replacement audio's volumes came to ignore every slider.
 */
const liveSettingsNow = (): GameSettings | null => lastSettings;

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

    // Cheat gating word (features3), guarded because older WASM lacks WasmSetGateWord.
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

    // Sub-volumes via WASM DSP (0-100 → 0-128 scale). Ambient is its own DSP group: the chip's
    // bed voices are allocated by its effects engine, and without the third group they rode the
    // SFX slider while the replacement bed rode the ambience one.
    const musicVol = settings.musicMuted ? 0 : Math.round(settings.musicVolume * 1.28);
    const ambientVol = settings.ambientMuted ? 0 : Math.round(settings.ambientVolume * 1.28);
    const sfxVol = settings.sfxMuted ? 0 : Math.round(settings.sfxVolume * 1.28);
    try { mod.ccall('WasmSetMusicVolume', null, ['number'], [musicVol]); lastMusicVol = musicVol; } catch {}
    try { mod.ccall('WasmSetAmbientVolume', null, ['number'], [ambientVol]); lastAmbientVol = ambientVol; } catch {}
    try { mod.ccall('WasmSetSfxVolume', null, ['number'], [sfxVol]); lastSfxVol = sfxVol; } catch {}
    // Replacement music is mixed in the app, not the sound chip, so it needs the same push.
    msuSyncVolume();

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

    log.app(`Live settings pushed: features 0x${features.toString(16)}, ppu 0x${ppuFlags.toString(16)}`);
    return true;
  } catch (e) {
    log.app(`Live settings push failed: ${e}`, 'error');
    return false;
  }
};

/** Guarded one-arg ccall. No-op if the module or export is unavailable. */
const tryVoidCcall = (fn: string, value: number): void => {
  const mod = getModule();
  if (!mod) return;
  try { mod.ccall(fn, null, ['number'], [value]); } catch { /* WASM may not have this export */ }
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
  tryVoidCcall('WasmSetAmbientVolume', lastAmbientVol);
  tryVoidCcall('WasmSetSfxVolume', lastSfxVol);
};

/**
 * Push all three feature words from the last primed/pushed settings. These words have no INI path
 * (config.c parses features0 only), so they only become non-zero through a ccall; priming cannot
 * ccall (module not running yet), so without this the granular fix words stayed zero all session.
 */
const reassertFeatureWords = (): void => {
  const mod = getModule();
  // Without primed settings there is nothing truthful to send: rebuilding features0 from
  // DEFAULT_SETTINGS would push a 4:3 non-extended word over the boot INI values.
  if (!mod || !lastSettings) return;
  const settings = lastSettings;
  const { features1, features2 } = buildFeatureWords(settings);
  tryVoidCcall('WasmSetFeatures', buildFeatureFlags(settings));
  tryVoidCcall('WasmSetFeatures1', features1);
  tryVoidCcall('WasmSetFeatures2', features2);
};

/** Re-assert every live flag after a save-state load clobbers WRAM. */
/** Recompute and re-push only the gate word (features3), so a live override (e.g. the randomizer arming its item-override table) reaches the core immediately. */
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
  // Gate words first: the C boot seed (emscripten_main.c) rebuilds word 3 from the INI (cheat bits
  // only), landing AFTER pushLiveSettings and dropping hudOverride/trackerNotifications/
  // playerSpriteOverride. Re-pushing here must precede the hide reasserts below so their requests
  // are already permitted when the core reconciles them.
  reassertGateWord3();
  reassertBackdropBlack();
  reassertVsync();
  reassertHudHidden();
  reassertPauseHidden();
  reassertVolumes();
};

/**
 * Recompute and re-push only the features word, so a live override (e.g. the simulator forcing
 * auto-skip-dialog on) reaches the core immediately. Falls back to DEFAULT_SETTINGS when nothing
 * was pushed/primed yet; buildFeatureFlags ORs the override in regardless.
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

export { LIVE_SETTINGS, liveSettingsNow, pushLiveSettings, reassertFeatureWords, reassertBackdropBlack, reassertVsync, reassertHudHidden, reassertPauseHidden, reassertVolumes, reassertLiveFlagsAfterLoad, reassertFeatureFlags, reassertGateWord3, primeLiveSettings };
