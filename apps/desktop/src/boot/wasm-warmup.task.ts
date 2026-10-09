/* @layer renderer-app @kind logic */
import { defineBootTask } from '@drizztdourden08/brock-react';
import { warmWasmCore } from '@app/game/wasm-warmup';
import { WASM_WARMUP_TIMEOUT_MS } from './wasm-warmup.task.constants';

export default defineBootTask({
  label: 'Loading the game core',
  weight: 3,
  timeoutMs: WASM_WARMUP_TIMEOUT_MS,
  run: ({ report }) => warmWasmCore((patch) => {
    if (typeof patch.ratio === 'number') report(patch.ratio, patch.message);
    else if (patch.message) report(0, patch.message);
  }),
});
