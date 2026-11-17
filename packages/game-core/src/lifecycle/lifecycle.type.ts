/* @layer bridge-wasm @kind types */
import type { ScreenTable } from '@rotp/asset-extraction';

interface AutoSaveConfig {
  enabled: boolean;
  intervalSeconds: number;
  maxEntries: number;
  saveOnQuit: boolean;
}

type LifecycleState = {
  pendingLinkSprite: Uint8Array | null;
  pendingLanguageScreens: readonly ScreenTable[];
  activeAutoSaveConfig: AutoSaveConfig | null;
  appPauseUnsub: (() => void) | null;
};

export type { AutoSaveConfig, LifecycleState };
