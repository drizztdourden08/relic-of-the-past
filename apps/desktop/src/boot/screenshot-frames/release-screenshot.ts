/* @layer renderer-app @kind logic */
import { log } from '@app/log-bus';
import { screenshotHold } from '../screenshot-hold';
import { captureFrames } from './capture-frames';
import type { ScreenshotKind } from './capture-frames.type';

const releaseScreenshot = async (kind: ScreenshotKind): Promise<void> => {
  try {
    await captureFrames(kind);
  } catch (error) {
    log.app(`--screenshot-frames capture failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
  } finally {
    screenshotHold.release();
  }
};

export { releaseScreenshot };
