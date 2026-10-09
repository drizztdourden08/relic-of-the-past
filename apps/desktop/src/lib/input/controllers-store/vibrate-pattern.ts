/* @layer renderer-lib @kind logic */
import type { VibrateStep, VibrateResult } from '@shared/platform';
import { getPlatform } from '@app/platform/get-platform';

const vibratePattern = (deviceKey: string, pattern: VibrateStep[], gapMs: number): Promise<VibrateResult> =>
  getPlatform().controllers.vibratePattern(deviceKey, pattern, gapMs);

export { vibratePattern };
