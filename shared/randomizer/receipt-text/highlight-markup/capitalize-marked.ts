/* @layer shared-game @kind logic */
import { isHighlightMarker } from './is-highlight-marker';

const capitalizeMarked = (text: string): string => {
  const at = [...text].findIndex((ch) => !isHighlightMarker(ch));
  if (at < 0) return text;
  const chars = [...text];
  chars[at] = chars[at].toUpperCase();
  return chars.join('');
};

export { capitalizeMarked };
