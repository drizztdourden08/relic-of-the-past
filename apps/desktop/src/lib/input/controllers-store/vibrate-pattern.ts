/* @layer renderer-lib @kind logic */
import { controllerHostPort } from '@app/platform/controller-host-port';
import type { VibrateStep, VibrateResult } from '@shared/platform';

const vibratePattern = (deviceKey: string, pattern: VibrateStep[], gapMs: number): Promise<VibrateResult> =>
  controllerHostPort().vibratePattern(deviceKey, pattern, gapMs);

export { vibratePattern };
