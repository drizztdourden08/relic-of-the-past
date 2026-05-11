/**
 * Game Instance — singleton WASM manager.
 * Ensures only one zelda3 instance runs at a time.
 */

import { log } from './log-bus';

// Default config for WASM builds
const DEFAULT_ZELDA3_INI = `[General]
Autosave = 0
ExtendedAspectRatio = 4:3

[Graphics]
WindowSize = Auto
Fullscreen = 0
WindowScale = 2
NewRenderer = 1
EnhancedMode7 = 1
NoSpriteLimits = 1
OutputMethod = SDL
LinearFiltering = 0

[Sound]
EnableAudio = 1
AudioFreq = 44100
AudioChannels = 2
AudioSamples = 2048
EnableMSU = false

[Features]
ItemSwitchLR = 0
TurnWhileDashing = 0
CollectItemsWithSword = 0
DisableLowHealthBeep = 0
SkipIntroOnKeypress = 0
`;

export interface EmscriptenFS {
  writeFile(path: string, data: Uint8Array | string): void;
  mkdir(path: string): void;
  readdir(path: string): string[];
  readFile(path: string): Uint8Array;
  analyzePath(path: string): { exists: boolean };
}

export interface EmscriptenModule {
  FS: EmscriptenFS;
  ccall(ident: string, returnType: string | null, argTypes: string[], args: unknown[]): unknown;
}

export type GameStatus = 'idle' | 'loading' | 'running' | 'error';

export interface GameState {
  status: GameStatus;
  error: string | null;
}

type GameStateListener = (state: GameState) => void;

let currentModule: EmscriptenModule | null = null;
let currentState: GameState = { status: 'idle', error: null };
let activeCrashHandler: ((e: ErrorEvent) => void) | null = null;
let startGeneration = 0;
let currentProfileId: string | null = null;
let sramSyncInterval: ReturnType<typeof setInterval> | null = null;
let lastSramHash: string | null = null;
const listeners = new Set<GameStateListener>();

function setState(next: GameState): void {
  currentState = next;
  for (const fn of listeners) {
    try { fn(next); } catch { /* ignore */ }
  }
}

export function getGameState(): GameState {
  return currentState;
}

export function getModule(): EmscriptenModule | null {
  return currentModule;
}

export function subscribeGameState(fn: GameStateListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Reset from error/running state back to idle so a new game can start. */
export function resetGame(): void {
  stopSramSync();
  if (activeCrashHandler) {
    window.removeEventListener('error', activeCrashHandler);
    activeCrashHandler = null;
  }
  if (currentModule) {
    // Stop SDL2 audio callbacks — the ScriptProcessorNode keeps firing
    // into corrupted WASM memory after a crash, generating stale errors.
    const sdl2 = (currentModule as any).SDL2 as
      | { audioContext?: AudioContext; audio?: { scriptProcessorNode?: AudioNode }; capture?: { scriptProcessorNode?: AudioNode } }
      | undefined;
    if (sdl2?.audio?.scriptProcessorNode) sdl2.audio.scriptProcessorNode.disconnect();
    if (sdl2?.capture?.scriptProcessorNode) sdl2.capture.scriptProcessorNode.disconnect();
    if (sdl2?.audioContext) sdl2.audioContext.close().catch(() => {});

    // Destroy the WebGL context so the next instance gets a clean one.
    const canvas = document.querySelector('.game-layer__canvas') as HTMLCanvasElement | null;
    if (canvas) {
      const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
      if (gl) gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  }
  currentModule = null;
  currentProfileId = null;
  (window as any).__zelda3Module = null;
  setState({ status: 'idle', error: null });
}

// ─── SRAM sync ───

function simpleHash(data: Uint8Array): string {
  let h = 0;
  for (let i = 0; i < data.length; i++) {
    h = ((h << 5) - h + data[i]) | 0;
  }
  return h.toString(36);
}

/** Read SRAM from MEMFS and persist to disk if changed. */
async function syncSramToDisk(): Promise<void> {
  if (!currentModule || !currentProfileId) return;
  try {
    currentModule.ccall('WasmSaveSram', null, [], []);
    const { exists } = currentModule.FS.analyzePath('/saves/sram.dat');
    if (!exists) {
      log.app('[SRAM] /saves/sram.dat does not exist in MEMFS — skipping sync');
      return;
    }
    const data = currentModule.FS.readFile('/saves/sram.dat');
    const hash = simpleHash(data);
    if (hash === lastSramHash) return; // unchanged
    lastSramHash = hash;
    await window.api.writeSram(currentProfileId, data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
    log.app(`[SRAM] Synced ${data.byteLength} bytes to disk (hash=${hash})`);
  } catch {
    // Silently ignore — may happen during shutdown
  }
}

function startSramSync(): void {
  stopSramSync();
  sramSyncInterval = setInterval(syncSramToDisk, 5000);
}

function stopSramSync(): void {
  if (sramSyncInterval) {
    clearInterval(sramSyncInterval);
    sramSyncInterval = null;
  }
  // Final sync
  syncSramToDisk();
}

// ─── Save States ───

/** Capture the game canvas as a PNG blob. */
function captureScreenshot(): Promise<Blob | null> {
  const canvas = document.querySelector('.game-layer__canvas') as HTMLCanvasElement | null;
  if (!canvas) return Promise.resolve(null);

  // SDL2 in Emscripten uses a 2D canvas context with putImageData, so
  // toBlob works directly. For WebGL canvases we'd need readPixels, but
  // our build uses the software SDL2 renderer.
  return new Promise((resolve) => {
    try {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    } catch {
      resolve(null);
    }
  });
}

export async function saveState(slot: number): Promise<boolean> {
  log.app(`[SaveState] saveState(${slot}) called — module=${!!currentModule}, profileId=${currentProfileId}`);
  if (!currentModule || !currentProfileId) {
    log.app('[SaveState] ABORT: no module or no profileId');
    return false;
  }
  try {
    log.app(`[SaveState] Calling ccall('WasmSaveState', slot=${slot})...`);
    currentModule.ccall('WasmSaveState', null, ['number'], [slot]);
    log.app('[SaveState] ccall returned');

    const savePath = `/saves/save${slot}.sav`;
    const { exists } = currentModule.FS.analyzePath(savePath);
    log.app(`[SaveState] MEMFS ${savePath} exists=${exists}`);
    if (!exists) {
      log.app('[SaveState] ABORT: file not found in MEMFS after ccall');
      return false;
    }

    const data = currentModule.FS.readFile(savePath);
    log.app(`[SaveState] Read ${data.byteLength} bytes from MEMFS`);

    const ab = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    log.app(`[SaveState] Sending ${ab.byteLength} bytes to main process (profileId=${currentProfileId}, slot=${slot})...`);
    await window.api.writeState(currentProfileId, slot, ab);
    log.app(`[SaveState] Slot ${slot} persisted to disk ✓`);

    // Capture and persist screenshot
    try {
      const blob = await captureScreenshot();
      if (blob) {
        const screenshotAb = await blob.arrayBuffer();
        await window.api.writeScreenshot(currentProfileId, slot, screenshotAb);
        log.app(`[SaveState] Screenshot saved (${(screenshotAb.byteLength / 1024).toFixed(0)} KB)`);
      }
    } catch {
      // Screenshot is best-effort
    }

    return true;
  } catch (err) {
    log.error(`[SaveState] EXCEPTION: ${err instanceof Error ? err.message : String(err)}`);
    if (err instanceof Error && err.stack) log.error(`[SaveState] ${err.stack}`);
    return false;
  }
}

export async function loadState(slot: number): Promise<boolean> {
  log.app(`[LoadState] loadState(${slot}) called — module=${!!currentModule}, profileId=${currentProfileId}`);
  if (!currentModule || !currentProfileId) {
    log.app('[LoadState] ABORT: no module or no profileId');
    return false;
  }
  try {
    log.app(`[LoadState] Reading slot ${slot} from disk (profileId=${currentProfileId})...`);
    const buffer = await window.api.readState(currentProfileId, slot);
    if (!buffer) {
      log.app(`[LoadState] No save state file on disk for slot ${slot}`);
      return false;
    }
    log.app(`[LoadState] Got ${buffer.byteLength} bytes from disk`);

    const savePath = `/saves/save${slot}.sav`;
    const arr = new Uint8Array(buffer);
    log.app(`[LoadState] Writing ${arr.byteLength} bytes to MEMFS ${savePath}`);
    currentModule.FS.writeFile(savePath, arr);

    const { exists } = currentModule.FS.analyzePath(savePath);
    log.app(`[LoadState] MEMFS verify: ${savePath} exists=${exists}`);

    log.app(`[LoadState] Calling ccall('WasmLoadState', slot=${slot})...`);
    currentModule.ccall('WasmLoadState', null, ['number'], [slot]);
    log.app(`[LoadState] ccall returned — state loaded ✓`);
    return true;
  } catch (err) {
    log.error(`[LoadState] EXCEPTION: ${err instanceof Error ? err.message : String(err)}`);
    if (err instanceof Error && err.stack) log.error(`[LoadState] ${err.stack}`);
    return false;
  }
}

export function getActiveProfileId(): string | null {
  return currentProfileId;
}

export async function startGame(
  canvas: HTMLCanvasElement,
  assetData: Uint8Array,
  configIni?: string,
  profileId?: string,
): Promise<void> {
  // Prevent multiple simultaneous instances
  if (currentState.status === 'loading' || currentState.status === 'running') {
    log.wasm('Game already running — ignoring start request');
    return;
  }

  // Clean up any previous crash handler
  if (activeCrashHandler) {
    window.removeEventListener('error', activeCrashHandler);
    activeCrashHandler = null;
  }

  startGeneration++;
  setState({ status: 'loading', error: null });
  log.wasm('Initializing WASM module...');

  // Start muted — the handler silently swallows ALL WASM errors during init
  // (the old instance may still be ticking). Only armed once the new module
  // is confirmed running. A second flag ensures we only log the first crash.
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

    // Log the WASM stack trace — shows which C functions were in the call chain.
    // Function names are mangled (wasm-function[123]) unless debug info is in the build.
    if (err.stack) {
      for (const line of err.stack.split('\n').slice(1, 10)) {
        const trimmed = line.trim();
        if (trimmed) log.error(`  ${trimmed}`);
      }
    }
    // Log the ErrorEvent source for cross-reference
    if (event.filename) {
      log.error(`  at ${event.filename}:${event.lineno}:${event.colno}`);
    }
  };

  try {
    activeCrashHandler = onWasmCrash;
    window.addEventListener('error', onWasmCrash);

    // Pre-load SRAM from disk if we have a profile
    let sramData: Uint8Array | null = null;
    if (profileId) {
      const buffer = await window.api.readSram(profileId);
      if (buffer) {
        sramData = new Uint8Array(buffer);
        log.app(`Loaded SRAM from profile (${sramData.byteLength} bytes)`);
      }
    }

    const module: EmscriptenModule = await Zelda3({
      canvas,
      preRun: [(mod: EmscriptenModule) => {
        log.wasm(`Writing assets to virtual FS (${(assetData.byteLength / 1024).toFixed(0)} KB)`);
        mod.FS.writeFile('/zelda3_assets.dat', assetData);
        mod.FS.writeFile('/zelda3.ini', configIni ?? DEFAULT_ZELDA3_INI);
        try { mod.FS.mkdir('/saves'); } catch { /* may exist */ }
        // Write pre-loaded SRAM to virtual FS so ZeldaReadSram() finds it
        if (sramData) {
          mod.FS.writeFile('/saves/sram.dat', sramData);
        }
      }],
      print: (text: string) => log.core(text),
      printErr: (text: string) => log.core(text, 'error'),
    });

    currentModule = module;
    currentProfileId = profileId ?? null;
    (window as any).__zelda3Module = module;
    setState({ status: 'running', error: null });
    log.wasm('WASM module running');
    canvas.focus();

    // Start periodic SRAM sync if we have a profile
    if (currentProfileId) {
      startSramSync();
    }

    // Delay arming briefly to let any residual callbacks from the old WASM
    // instance fire and be silently suppressed. The generation guard ensures
    // we don't arm a superseded handler if startGame is called again.
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
}
