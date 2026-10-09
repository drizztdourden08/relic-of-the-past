/* @layer electron-main @kind logic */
import { copyFile } from 'fs/promises';
import { join } from 'path';
import type { DebugCaptureScreenshot } from '@app/debug-report';
import { frameName, pickEvenlySpread, budgetedFrameCount } from '../capture-frame-budget';
import { PACKAGED_BUDGET_BYTES } from './finalize-capture-session.constants';

const buildPackagedFrames = async (
  packagedDir: string, dir: string, screenshots: DebugCaptureScreenshot[], frameNames: string[],
): Promise<void> => {
  const totalBytes = screenshots.reduce((sum, s) => sum + s.png.byteLength, 0);
  const targetCount = budgetedFrameCount(totalBytes, frameNames.length, PACKAGED_BUDGET_BYTES);
  const selected = pickEvenlySpread(frameNames, targetCount);
  await Promise.all(selected.map((name, i) => copyFile(join(dir, name), join(packagedDir, frameName(i)))));
};

export { buildPackagedFrames };
