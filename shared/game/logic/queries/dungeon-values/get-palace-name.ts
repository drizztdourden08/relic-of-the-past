/* @layer shared-game @kind logic */
import { PALACE_INDEX_NAMES } from '../../../data';

const getPalaceName = (palaceIndex: number): string =>
  PALACE_INDEX_NAMES[palaceIndex] ?? `Unknown (0x${palaceIndex.toString(16).toUpperCase()})`;

export { getPalaceName };
