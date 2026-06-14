/* @layer bridge-wasm @kind logic */
/**
 * Game Lifecycle — startGame / resetGame orchestration.
 * Composes wasm-bridge, sram-sync, save-states, and randomizer.
 */

import { log } from '../log-bus';
import * as savesStore from '../storage/saves-store';
import type { EmscriptenModule } from './types';
import { DEFAULT_ZELDA3_INI } from './config';
import { getModule, setModule, setProfileId, getProfileId, setState, setInput, getGameState } from './wasm-bridge';
import { startSramSync, stopSramSync } from './sram-sync';
import { startAutoSave, stopAutoSave, saveOnQuit } from './auto-save';
import { resetMasterVolume } from './audio-volume';
import { reassertVolumes } from './live-settings';
import { initTrackerBridge, destroyTrackerBridge } from './tracker';
import { startSession, endSession } from './session-tracker';
import { getInputManager } from '../input/input-manager';
import { initHapticBridge, destroyHapticBridge, updateHapticBridgeSettings } from '../input/haptic-bridge';
import { initUIBridge, stopUIBridge } from './ui-bridge';
import { useGameUIStore } from '../../stores/game-ui-store';
import { DEFAULT_SETTINGS } from './settings';
import { deliveryQueue } from './delivery-queue';
import { createInstantiateWasm } from './instantiate-wasm';

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

    // Free GPU resources — safe because the FX renderer guards with isContextLost()
    const canvas = (mod as any).canvas as HTMLCanvasElement | undefined;
    if (canvas) {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    }
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

    const instantiateWasm = createInstantiateWasm();

    const module: EmscriptenModule = await Zelda3({
      canvas,
      instantiateWasm,
      preRun: [(mod: EmscriptenModule) => {
        log.wasm(`Writing assets to virtual FS (${(assetData.byteLength / 1024).toFixed(0)} KB)`);
        mod.FS.writeFile('/zelda3_assets.dat', assetData);
        mod.FS.writeFile('/zelda3.ini', configIni ?? DEFAULT_ZELDA3_INI);
        try { mod.FS.mkdir('/saves'); } catch { /* may exist */ }
        if (sramData) {
          mod.FS.writeFile('/saves/sram.dat', sramData);
        }
        // Write MSU pack files to MEMFS
        if (pendingMsuData && pendingMsuData.length > 0) {
          try { mod.FS.mkdir('/msu'); } catch { /* may exist */ }
          log.app(`[MSU] Writing ${pendingMsuData.length} tracks to MEMFS...`);
          for (const track of pendingMsuData) {
            mod.FS.writeFile(`/msu/${track.num}.${track.ext}`, track.data);
          }
          log.app(`[MSU] All tracks written to MEMFS`);
          pendingMsuData = null; // Free staging memory
        }
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
    setState({ status: 'running', error: null });
    log.wasm('WASM module running');
    canvas.focus();

    // ─── Apply saved volume settings immediately ───
    reassertVolumes();

    // ─── Input manager: wire JS-driven input to WASM ───
    const inputMgr = getInputManager();
    inputMgr.setWasmBridge(setInput);
    inputMgr.start();

    // ─── Tracker bridge: wire up item/inventory notifications ───
    initTrackerBridge();

    // ─── Haptic bridge: wire up vibration feedback for game events ───
    initHapticBridge(DEFAULT_SETTINGS.haptics);

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

export { resetGame, setAutoSaveConfig, setMsuData, startGame };
export type { AutoSaveConfig, MsuTrackData };
