/* @layer renderer-appshell @kind logic */
import { loadStateRef } from '@app/game';
import type { TestArgs } from '@app/ipc';
import { log } from '@app/log-bus';
import { RENDER_SETTLE_MS } from './auto-launch.constants';

const settleAutoState = async (args: TestArgs): Promise<void> => {
  if (args.autoState !== null) {
    const kind = typeof args.autoState === 'number' ? 'quick slot' : 'manual save';
    log.app(`[AutoTest] Loading ${kind} ${args.autoState}...`);
    await loadStateRef(args.autoState);
  }
  if (args.autoState !== null || args.screenshot) {
    await new Promise((resolve) => { setTimeout(resolve, RENDER_SETTLE_MS); });
  }
};

export { settleAutoState };
