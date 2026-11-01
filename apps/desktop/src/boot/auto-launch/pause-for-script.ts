/* @layer renderer-app @kind logic */
import { wasmSetPaused } from '@rotp/game-core';
import type { LoadedScript } from '../input-script/input-script.type';

const pauseForScript = (script: LoadedScript): void => {
  if (script.kind === 'ready') wasmSetPaused(true);
};

export { pauseForScript };
