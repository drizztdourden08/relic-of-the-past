/* @layer bridge-wasm @kind logic */
import type { EmscriptenModule } from '@rotp/game-core';
import { getModule } from '@rotp/game-core';
import { bootStandalone } from './boot-standalone';
import { previewCoreState } from '@rotp/game-core';

const ensurePreviewModule = async (): Promise<EmscriptenModule | null> => {
  const game = getModule();
  if (game !== null) {
    previewCoreState.standalone = null;
    previewCoreState.standaloneRom = null;
    return game;
  }
  if (previewCoreState.standalone !== null) return previewCoreState.standalone;

  previewCoreState.booting ??= bootStandalone().then((mod) => {
    previewCoreState.standalone = mod;
    previewCoreState.booting = null;
    return mod;
  });
  return previewCoreState.booting;
};

export { ensurePreviewModule };
