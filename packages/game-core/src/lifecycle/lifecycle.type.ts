/* @layer bridge-wasm @kind types */
interface AutoSaveConfig {
  enabled: boolean;
  intervalSeconds: number;
  maxEntries: number;
  saveOnQuit: boolean;
}

type LifecycleState = {
  pendingLinkSprite: Uint8Array | null;
  activeAutoSaveConfig: AutoSaveConfig | null;
  appPauseUnsub: (() => void) | null;
};

export type { AutoSaveConfig, LifecycleState };
