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
  (window as any).__zelda3Module = null;
  setState({ status: 'idle', error: null });
}

export async function startGame(
  canvas: HTMLCanvasElement,
  assetData: Uint8Array,
  configIni?: string,
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

    const module: EmscriptenModule = await Zelda3({
      canvas,
      preRun: [(mod: EmscriptenModule) => {
        log.wasm(`Writing assets to virtual FS (${(assetData.byteLength / 1024).toFixed(0)} KB)`);
        mod.FS.writeFile('/zelda3_assets.dat', assetData);
        mod.FS.writeFile('/zelda3.ini', configIni ?? DEFAULT_ZELDA3_INI);
        try { mod.FS.mkdir('/saves'); } catch { /* may exist */ }
      }],
      print: (text: string) => log.core(text),
      printErr: (text: string) => log.core(text, 'error'),
    });

    currentModule = module;
    (window as any).__zelda3Module = module;
    setState({ status: 'running', error: null });
    log.wasm('WASM module running');
    canvas.focus();

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
