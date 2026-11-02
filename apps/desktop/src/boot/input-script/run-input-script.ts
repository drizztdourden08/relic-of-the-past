/* @layer renderer-app @kind logic */
import { setInput } from '@rotp/game-core';
import { log } from '@app/log-bus';
import { getInputManager } from '@app/input/input-manager/get-input-manager';
import { awaitPlainPlay } from './await-plain-play';
import { STEP_CHUNK_FRAMES } from './input-script.constants';
import type { ScriptStep } from './input-script.type';
import { runChunk } from './run-chunk';

const runStep = async (step: ScriptStep): Promise<boolean> => {
  setInput(step.mask);
  for (let left = step.frames; left > 0; left -= STEP_CHUNK_FRAMES) {
    if (!(await runChunk(Math.min(left, STEP_CHUNK_FRAMES)))) return false;
  }
  return true;
};

const runInputScript = async (steps: readonly ScriptStep[]): Promise<boolean> => {
  const total = steps.reduce((sum, step) => sum + step.frames, 0);
  const manager = getInputManager();
  manager.setInputSuppressed(true);
  try {
    await awaitPlainPlay();
    log.app(`[InputScript] Playing ${steps.length} steps over ${total} frames`);
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
