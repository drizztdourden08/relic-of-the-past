/* @layer renderer-app @kind logic */
import { wasmSetPaused } from '@rotp/game-core';
import type { LoadedScript } from '../input-script/input-script.type';
import { runInputScript } from '../input-script/run-input-script';

const playScript = async (script: LoadedScript, holdsPause: boolean): Promise<void> => {
  if (script.kind !== 'ready') return;
  await runInputScript(script.steps);
  if (!holdsPause) wasmSetPaused(false);
};

export { playScript };
