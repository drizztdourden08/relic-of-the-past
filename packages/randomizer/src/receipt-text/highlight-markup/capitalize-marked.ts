/* @layer shared-game @kind logic */
import { isHighlightMarker } from '@rotp/game-core';
import { itemAt } from '../../checked-access';

const capitalizeMarked = (text: string): string => {
  const at = [...text].findIndex((ch) => !isHighlightMarker(ch));
  if (at < 0) return text;
  const chars = [...text];
  chars[at] = itemAt(chars, at).toUpperCase();
  return chars.join('');
};

export { capitalizeMarked };
