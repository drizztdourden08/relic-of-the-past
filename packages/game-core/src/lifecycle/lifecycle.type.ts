/* @layer bridge-wasm @kind types */
interface AutoSaveConfig {
  enabled: boolean;
  intervalSeconds: number;
  maxEntries: number;
  saveOnQuit: boolean;
}

type Sdl2Runtime = {
  audioContext?: AudioContext;
  audio?: { scriptProcessorNode?: AudioNode };
  capture?: { scriptProcessorNode?: AudioNode };
};

type CoreRuntimeExtras = {
  SDL2?: Sdl2Runtime;
  canvas?: HTMLCanvasElement;
};

type LifecycleState = {
  pendingLinkSprite: Uint8Array | null;
  activeAutoSaveConfig: AutoSaveConfig | null;
  activeCrashHandler: ((e: ErrorEvent) => void) | null;
  appPauseUnsub: (() => void) | null;
  startGeneration: number;
};

type WasmCrashGuard = {
  handler: (event: ErrorEvent) => void;
  arm: () => void;
};

export type { AutoSaveConfig, CoreRuntimeExtras, LifecycleState, Sdl2Runtime, WasmCrashGuard };
