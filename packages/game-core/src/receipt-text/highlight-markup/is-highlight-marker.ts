/* @layer shared-game @kind logic */
import { HIGHLIGHT_KIND } from './highlight-markup.constants';

const isHighlightMarker = (ch: string): boolean => HIGHLIGHT_KIND.has(ch);

export { isHighlightMarker };
