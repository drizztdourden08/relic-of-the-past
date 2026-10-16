/* @layer renderer-components @kind logic */
import { log } from '@app/log-bus';
import type { UndoStep } from './undo.type';

const runQuietly = async (step: UndoStep | undefined, what: string): Promise<void> => {
  try {
    await step?.();
  } catch (error) {
    log.app(`Could not ${what}: ${error instanceof Error ? error.message : String(error)}`, 'error');
  }
};

export { runQuietly };
