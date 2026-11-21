/* @layer shared-game @kind logic */
import { INSTANT_SPEED, ORIGINAL_SPEED } from './pacing.constants';
import type { DialogSpeedWords } from './dialog-speed-words.type';

const formatDialogSpeed = (stop: number, words: DialogSpeedWords): string => {
  if (stop === INSTANT_SPEED) return words.instant;
  if (stop === ORIGINAL_SPEED) return words.original;
  return `${stop}x`;
};

export { formatDialogSpeed };
