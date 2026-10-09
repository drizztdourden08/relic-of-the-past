/* @layer shared-game @kind logic */
import { turboSpeedAt } from './turbo-speed-at';
import { turboSpeedIndex } from './turbo-speed-index';

const turboSpeedPercent = (speed: number): number => Math.round(turboSpeedAt(turboSpeedIndex(speed)) * 100);

export { turboSpeedPercent };
