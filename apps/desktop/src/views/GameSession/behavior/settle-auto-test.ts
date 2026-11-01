/* @layer renderer-appshell @kind logic */
import { loadStateRef } from '@app/game';
import { log } from '@app/log-bus';
import { releaseScreenshot } from '@app/boot/screenshot-frames/release-screenshot';
import type { AutoTestArgs } from './auto-test-args.type';
import { RENDER_SETTLE_MS } from './auto-launch.constants';

const settleAutoTest = async (args: AutoTestArgs): Promise<void> => {
  if (args.autoState !== null) {
    const kind = typeof args.autoState === 'number' ? 'quick slot' : 'manual save';
    log.app(`[AutoTest] Loading ${kind} ${args.autoState}...`);
    await loadStateRef(args.autoState);
    await new Promise((r) => setTimeout(r, RENDER_SETTLE_MS));
  } else if (args.screenshot) {
    await new Promise((r) => setTimeout(r, RENDER_SETTLE_MS));
  }

  if (args.screenshot) {
    log.app(`[AutoTest] Game frame drawn, releasing screenshot "${args.screenshot}"`);
    await releaseScreenshot('game');
  }
};

export { settleAutoTest };
