/* @layer renderer-app @kind logic */
import { wasmGetPendingSteps, wasmStepFrames } from '@rotp/game-core';
import { waitFrames } from '../screenshot-frames/wait-frames';
import { MAX_STEP_WAIT_TICKS } from './input-script.constants';

const runChunk = async (frames: number): Promise<boolean> => {
  wasmStepFrames(frames);
  for (let waited = 0; wasmGetPendingSteps() > 0; waited += 1) {
    if (waited >= MAX_STEP_WAIT_TICKS) return false;
    await waitFrames(1);
  }
  return true;
};

export { runChunk };
