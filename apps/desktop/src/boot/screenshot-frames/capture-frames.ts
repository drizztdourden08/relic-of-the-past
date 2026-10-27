/* @layer renderer-app @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { wasmSetPaused } from '@rotp/game-core';
import { screenshotFrameCount } from '@app/launch-flags/screenshot-frames';
import { SETTLE_FRAMES } from './screenshot-frames.constants';
import { frameName } from './frame-name';
import { stepEmulatorFrame } from './step-emulator-frame';
import { waitFrames } from './wait-frames';

type ScreenshotKind = 'hub' | 'game';

const shoot = (name: string, index: number): Promise<string> => requireHostApi().takeScreenshot(frameName(name, index));

const captureHubFrames = async (name: string, count: number): Promise<void> => {
  for (let i = 1; i <= count; i += 1) {
    await waitFrames(1);
    await shoot(name, i);
  }
};

const captureGameFrames = async (name: string, count: number): Promise<void> => {
  wasmSetPaused(true);
  try {
    await waitFrames(SETTLE_FRAMES);
    for (let i = 1; i <= count; i += 1) {
      if (i > 1) await stepEmulatorFrame();
      await shoot(name, i);
    }
  } finally {
    wasmSetPaused(false);
  }
};

const captureFrames = async (kind: ScreenshotKind): Promise<void> => {
  const count = screenshotFrameCount();
  if (count < 2) return;
  const { screenshot } = await requireHostApi().getTestArgs();
  if (!screenshot) return;
  await (kind === 'game' ? captureGameFrames : captureHubFrames)(screenshot, count);
};

export { captureFrames };
export type { ScreenshotKind };
