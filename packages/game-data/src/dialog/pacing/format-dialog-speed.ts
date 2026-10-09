/* @layer shared-game @kind logic */
import { INSTANT_SPEED, ORIGINAL_SPEED } from './pacing.constants';

const formatDialogSpeed = (stop: number): string => {
  if (stop === INSTANT_SPEED) return 'Instant';
  if (stop === ORIGINAL_SPEED) return 'Original';
  return `${stop}x`;
};

export { formatDialogSpeed };
