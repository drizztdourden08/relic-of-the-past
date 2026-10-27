/* @layer renderer-app @kind logic */
import { wasmGetPendingSteps, wasmStepFrames } from '@rotp/game-core';
import { MAX_STEP_WAIT_FRAMES, SETTLE_FRAMES } from './screenshot-frames.constants';
import { waitFrames } from './wait-frames';

const stepEmulatorFrame = async (): Promise<void> => {
  wasmStepFrames(1);
  for (let waited = 0; waited < MAX_STEP_WAIT_FRAMES && wasmGetPendingSteps() > 0; waited += 1) await waitFrames(1);
  await waitFrames(SETTLE_FRAMES);
};

export { stepEmulatorFrame };
