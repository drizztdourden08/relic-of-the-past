/* @layer renderer-app @kind logic */
import { setInput, wasmGetPendingSteps, wasmStepFrames } from '@rotp/game-core';
import { log } from '@app/log-bus';
import { getInputManager } from '@app/input/input-manager/get-input-manager';
import { waitFrames } from '../screenshot-frames/wait-frames';
import { MAX_STEP_WAIT_TICKS, STEP_CHUNK_FRAMES } from './input-script.constants';
import type { ScriptStep } from './input-script.type';

const runChunk = async (frames: number): Promise<boolean> => {
  wasmStepFrames(frames);
  for (let waited = 0; wasmGetPendingSteps() > 0; waited += 1) {
    if (waited >= MAX_STEP_WAIT_TICKS) return false;
    await waitFrames(1);
  }
  return true;
};

const runStep = async (step: ScriptStep): Promise<boolean> => {
  setInput(step.mask);
  for (let left = step.frames; left > 0; left -= STEP_CHUNK_FRAMES) {
    if (!(await runChunk(Math.min(left, STEP_CHUNK_FRAMES)))) return false;
  }
  return true;
};

/** Plays the steps against a paused core, one emulator frame per drawn tick, so the result does not depend on wall-clock time. */
const runInputScript = async (steps: readonly ScriptStep[]): Promise<boolean> => {
  const total = steps.reduce((sum, step) => sum + step.frames, 0);
  const manager = getInputManager();
  manager.setInputSuppressed(true);
  log.app(`[InputScript] Playing ${steps.length} steps over ${total} frames`);
  try {
    for (const step of steps) {
      if (!(await runStep(step))) {
        log.app('[InputScript] The core stopped taking steps; script abandoned', 'error');
        return false;
      }
    }
    log.app(`[InputScript] Done after ${total} frames`);
    return true;
  } finally {
    setInput(0);
    manager.setInputSuppressed(false);
  }
};

export { runInputScript };
