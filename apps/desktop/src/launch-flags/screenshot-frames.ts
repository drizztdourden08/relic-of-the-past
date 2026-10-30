/* @layer renderer-lib @kind logic */
import { log } from '../log-bus';
import { startupFlag } from './startup-flag';
import { MAX_SCREENSHOT_FRAMES } from './screenshot-frames.constants';

const warn = (raw: string | true, why: string): void =>
  log.app(`--screenshot-frames=${String(raw)} ${why}; capturing 1 frame`, 'warn');

const screenshotFrameCount = (): number => {
  const raw = startupFlag('screenshot-frames');
  if (raw === undefined) return 1;
  const count = typeof raw === 'string' && /^\d+$/.test(raw) ? Number(raw) : 0;
  if (count < 1) {
    warn(raw, 'is not a whole number of at least 1');
    return 1;
  }
  if (count > MAX_SCREENSHOT_FRAMES) {
    log.app(`--screenshot-frames=${count} is above the cap; capturing ${MAX_SCREENSHOT_FRAMES} frames`, 'warn');
    return MAX_SCREENSHOT_FRAMES;
  }
  return count;
};

export { screenshotFrameCount };
