/* @layer electron-main @kind logic */
import { mkdir, copyFile, rm, stat } from 'fs/promises';
import { join } from 'path';
import type { ToolsMain } from '@drizztdourden08/brock-tools/main';
import { frameName, pickEvenlySpread, budgetedFrameCount } from '../capture-frame-budget';
import { encodeFromFrameDir } from './encode-from-frame-dir';
import { PACKAGED_BUDGET_BYTES } from './finalize-capture-session.constants';
import type { PackagedVideoInput } from './build-packaged-video.type';

const buildPackagedVideo = async (tools: ToolsMain, input: PackagedVideoInput): Promise<void> => {
  const { dir, packagedDir, frameNames, fullVideoPath } = input;
  const fullStat = await stat(fullVideoPath).catch(() => null);
  if (!fullStat) return;
  if (fullStat.size <= PACKAGED_BUDGET_BYTES) {
    await copyFile(fullVideoPath, join(packagedDir, 'video.mp4'));
    return;
  }
  const targetCount = budgetedFrameCount(fullStat.size, frameNames.length, PACKAGED_BUDGET_BYTES);
  const selected = pickEvenlySpread(frameNames, targetCount);
  const scratchDir = join(dir, '.packaged-frames');
  await mkdir(scratchDir, { recursive: true });
  try {
    await Promise.all(selected.map((name, i) => copyFile(join(dir, name), join(scratchDir, frameName(i)))));
    await encodeFromFrameDir(tools, scratchDir, join(packagedDir, 'video.mp4'));
  } finally {
    await rm(scratchDir, { recursive: true, force: true }).catch(() => {});
  }
};

export { buildPackagedVideo };
