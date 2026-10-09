/* @layer shared-game @kind logic */
import { turboSpeedAt } from './turbo-speed-at';
import { turboSpeedIndex } from './turbo-speed-index';

const formatTurboSpeed = (speed: number): string => `${turboSpeedAt(turboSpeedIndex(speed))}x`;

export { formatTurboSpeed };
