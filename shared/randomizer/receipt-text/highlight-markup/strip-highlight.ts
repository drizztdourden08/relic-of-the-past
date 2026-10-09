/* @layer shared-game @kind logic */
import { MARKERS_RE } from './highlight-markup.constants';

const stripHighlight = (text: string): string => text.replace(MARKERS_RE, '');

export { stripHighlight };
