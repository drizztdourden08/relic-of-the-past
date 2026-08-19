/* @layer bridge-wasm @kind logic */
/**
 * Game Lifecycle — startGame / resetGame orchestration.
 * Composes wasm-bridge, sram-sync, save-states, and randomizer.
 */

import { log } from '../log-bus';
import * as savesStore from '../storage/saves-store';
import type { EmscriptenModule } from './types';
import { writeBootFiles } from './boot-files';
import { getModule, setModule, setProfileId, getProfileId, setState, setInput, getGameState } from './wasm-bridge';
import { startSramSync, stopSramSync } from './sram-sync';
import { startAutoSave, stopAutoSave, saveOnQuit } from './auto-save';
import { resetMasterVolume } from './audio-volume';
import { reassertLiveFlagsAfterLoad } from './live-settings';
import { initTrackerBridge, destroyTrackerBridge } from './tracker';
import { initTransitionEventsBridge, destroyTransitionEventsBridge } from './events/transition-events';
import { startSession, endSession } from './session-tracker';
import { getInputManager } from '../input/input-manager';
import { initHapticBridge, destroyHapticBridge, updateHapticBridgeSettings } from '../input/haptic-bridge';
import { initUIBridge, stopUIBridge } from './ui-bridge';
import { useGameUIStore } from '../../stores/game-ui-store';
import { DEFAULT_SETTINGS } from './settings';
import { deliveryQueue } from './delivery-queue';
import { createInstantiateWasm } from './instantiate-wasm';
import { readOamSnapshot } from './oam-snapshot';
import { readOamRing } from './oam-ring';
import { loadGlueScript } from './wasm-warmup';
import { getPlatform } from '../../platform/get-platform';

declare function Zelda3(config: Record<string, unknown>): Promise<EmscriptenModule>;

// ─── MSU data staging ───
interface MsuTrackData {
  num: number;
  ext: string;
  data: Uint8Array;
}

let pendingMsuData: MsuTrackData[] | null = null;

const setMsuData = (data: MsuTrackData[] | null): void => {
  pendingMsuData = data;
};

// Custom player sprite (.zspr) staged for the next boot — written to MEMFS where ApplyCustomLinkGraphics reads it.
let pendingLinkSprite: Uint8Array | null = null;

const setLinkSpriteData = (data: Uint8Array | null): void => {
  pendingLinkSprite = data;
};

// ─── Auto-save config (set before game start, used during stop) ───
interface AutoSaveConfig {
  enabled: boolean;
  intervalSeconds: number;
  maxEntries: number;
  saveOnQuit: boolean;
}

let activeAutoSaveConfig: AutoSaveConfig | null = null;

const setAutoSaveConfig = (config: AutoSaveConfig | null): void => {
  activeAutoSaveConfig = config;
};

let activeCrashHandler: ((e: ErrorEvent) => void) | null = null;

// Mobile: unsubscribe for the app-backgrounded → save-on-background hook.
let appPauseUnsub: (() => void) | null = null;
let startGeneration = 0;

const resetGame = async (): Promise<void> => {
  // Save-on-quit: create auto-save before teardown
  if (activeAutoSaveConfig?.saveOnQuit) {
    try {
      await saveOnQuit();
      if (activeAutoSaveConfig.maxEntries) {
        const profileId = getProfileId();
        if (profileId) {
          await savesStore.pruneAutoSaves(profileId, activeAutoSaveConfig.maxEntries);
        }
      }
    } catch {
      // Best-effort — don't block shutdown
    }
  }

  await endSession();
  stopAutoSave();
  stopSramSync();
  stopUIBridge();
  deliveryQueue.stopProcessing();
  deliveryQueue.clear();
  destroyTrackerBridge();
  destroyHapticBridge();
  destroyTransitionEventsBridge();
  appPauseUnsub?.();
  appPauseUnsub = null;
  getPlatform().device.allowSleep();
  resetMasterVolume();
  getInputManager().stop();
  if (activeCrashHandler) {
    window.removeEventListener('error', activeCrashHandler);
    activeCrashHandler = null;
  }
  const mod = getModule();
  if (mod) {
    // Stop Emscripten's main loop to prevent stale rendering
    try { (mod as any)._emscripten_cancel_main_loop?.(); } catch { /* ignore */ }

    const sdl2 = (mod as any).SDL2 as
      | { audioContext?: AudioContext; audio?: { scriptProcessorNode?: AudioNode }; capture?: { scriptProcessorNode?: AudioNode } }
      | undefined;
    if (sdl2?.audio?.scriptProcessorNode) sdl2.audio.scriptProcessorNode.disconnect();
    if (sdl2?.capture?.scriptProcessorNode) sdl2.capture.scriptProcessorNode.disconnect();
    if (sdl2?.audioContext) sdl2.audioContext.close().catch(() => {});

    // Free GPU resources — safe because the FX renderer guards with isContextLost().
    // The game canvas is WebGL1 (see startGame), so probe just that.
    const canvas = (mod as any).canvas as HTMLCanvasElement | undefined;
    canvas?.getContext('webgl')?.getExtension('WEBGL_lose_context')?.loseContext();
  }
  setModule(null);
  setProfileId(null);
  (window as any).__zelda3Module = null;
  setState({ status: 'idle', error: null });
};

const startGame = async (canvas: HTMLCanvasElement, assetData: Uint8Array, configIni?: string, profileId?: string): Promise<void> => {
  // Re-entry guard MUST be synchronous (no await before setState('loading') below),
  // or React StrictMode's rapid double-invoke in dev clears the guard twice before
  // either sets 'loading' → two WASM loads → renderer crash / black screen. getGameState
  // is statically imported (not awaited) precisely so this check can't yield first.
  const currentState = getGameState();

  if (currentState.status === 'loading' || currentState.status === 'running') {
    log.wasm('Game already running — ignoring start request');
    return;
  }

  if (activeCrashHandler) {
    window.removeEventListener('error', activeCrashHandler);
    activeCrashHandler = null;
  }

  startGeneration++;
  setState({ status: 'loading', error: null });
  log.wasm('Initializing WASM module...');

  let armed = false;
  let crashed = false;

  const onWasmCrash = (event: ErrorEvent) => {
    const err = event.error;
    if (!(err instanceof WebAssembly.RuntimeError)) return;
    event.preventDefault();
    if (!armed || crashed) return;
    crashed = true;
    setState({ status: 'error', error: `WASM crashed: ${err.message}` });
    log.error(`WASM crashed: ${err.message}`);
    if (err.stack) {
      for (const line of err.stack.split('\n').slice(1, 10)) {
        const trimmed = line.trim();
        if (trimmed) log.error(`  ${trimmed}`);
      }
    }
    if (event.filename) {
      log.error(`  at ${event.filename}:${event.lineno}:${event.colno}`);
    }
  };

  try {
    activeCrashHandler = onWasmCrash;
    window.addEventListener('error', onWasmCrash);

    let sramData: Uint8Array | null = null;
    if (profileId) {
      const buffer = await savesStore.readSram(profileId);
      if (buffer) {
        sramData = new Uint8Array(buffer);
        log.app(`Loaded SRAM from profile (${sramData.byteLength} bytes)`);
      }
    }

    // Ensure the Emscripten glue is present before calling Zelda3() — the glue is
    // now loaded lazily by the background warmup, which may not have finished yet.
    await loadGlueScript();

    const instantiateWasm = createInstantiateWasm();

    // preserveDrawingBuffer=true lets the edge-glow renderer cross-read the canvas on
    // Linux (native GL clears the backbuffer after SDL_RenderPresent); Emscripten reuses
    // this same-type context. MUST be 'webgl' (WebGL1) — SDL2's Emscripten renderer is
    // GLES2/WebGL1 (build sets no MAX_WEBGL_VERSION). A 'webgl2' context here makes SDL's
    // getContext('webgl') null → accelerated renderer fails → software fallback's
    // getContext('2d') is null too → "createImageData of null" (crashed Android's WebView).
    canvas.getContext('webgl', { preserveDrawingBuffer: true });

    const module: EmscriptenModule = await Zelda3({
      canvas,
      instantiateWasm,
      preRun: [(mod: EmscriptenModule) => {
        writeBootFiles(mod, { assetData, configIni, sramData, msu: pendingMsuData, linkSprite: pendingLinkSprite });
        pendingMsuData = null; // free staging memory
        pendingLinkSprite = null;
      }],
      print: (text: string) => {
        log.core(text);
        if (text.startsWith('[TRACE]')) console.log(text);
      },
      printErr: (text: string) => log.core(text, 'error'),
    });

    setModule(module);
    setProfileId(profileId ?? null);
    // Debug-only handle for devtools inspection; the canonical module ref is
    // wasm-bridge's `currentModule` (set via setModule above) — never read this in code.
    (window as any).__zelda3Module = module;
    // Debug-only handle for the OAM snapshot query; gated on the developer-tools setting in C, so it
    // returns null when that is off. Lets a diagnostic read the sprite table as the PPU sees it,
    // including the wide/tall high-coordinate side channels a screenshot cannot show.
    (window as any).__oamSnapshot = readOamSnapshot;
    // Drains the per-frame OAM ring the core fills after each frame's OAM is complete. Same developer-tools
    // gate; unlike the live snapshot above it carries no sampling race against the game loop.
    (window as any).__oamRing = readOamRing;
    setState({ status: 'running', error: null });
    log.wasm('WASM module running');
    canvas.focus();

    // ─── Apply saved live flags (HUD/pause/backdrop hide, volumes) immediately ───
    // A freshly-loaded module starts with every flag at default, so push the primed
    // values now — otherwise the native HUD-hide flag stays off and the original HUD
    // renders alongside the enhanced overlay.
    reassertLiveFlagsAfterLoad();

    // ─── Input manager: wire JS-driven input to WASM ───
    const inputMgr = getInputManager();
    inputMgr.setWasmBridge(setInput);
    inputMgr.start();

    // ─── Tracker bridge: wire up item/inventory notifications ───
    initTrackerBridge();

    // ─── Haptic bridge: wire up vibration feedback for game events ───
    initHapticBridge(DEFAULT_SETTINGS.haptics);

    // ─── Transition events bridge: wire up window.__onTransitionSettled ───
    initTransitionEventsBridge();

    // ─── Device lifecycle: hold the screen awake; save when backgrounded (mobile) ───
    getPlatform().device.keepAwake();
    appPauseUnsub = getPlatform().device.onAppPause(() => { void saveOnQuit(); });

    // ─── UI bridge: start rAF polling for React overlay state ───
    initUIBridge(useGameUIStore.getState()._setState);

    // ─── Delivery queue: start processing pending item deliveries ───
    deliveryQueue.startProcessing();

    if (getProfileId()) {
      startSession(getProfileId()!);
      startSramSync();
      // Start auto-save timer if configured
      if (activeAutoSaveConfig?.enabled) {
        startAutoSave(activeAutoSaveConfig.intervalSeconds, activeAutoSaveConfig.maxEntries);
      }
    }

    const myGen = startGeneration;
    await new Promise<void>((r) => setTimeout(r, 200));
    if (myGen !== startGeneration) return;
    armed = true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(`WASM failed: ${msg}`);
    setState({ status: 'error', error: msg });
    window.removeEventListener('error', onWasmCrash);
  }
};

export { resetGame, setAutoSaveConfig, setMsuData, setLinkSpriteData, startGame };
export type { AutoSaveConfig, MsuTrackData };
