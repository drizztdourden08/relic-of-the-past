/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';
import { turboSpeedPercent } from '@shared/display/turbo-speed';
import { REAL_TIME_PERCENT } from './turbo.constants';

const turboPercentFor = (settings: GameSettings): number =>
  settings.turboEnabled ? turboSpeedPercent(settings.turboSpeed) : REAL_TIME_PERCENT;

export { turboPercentFor };
