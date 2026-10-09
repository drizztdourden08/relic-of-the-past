/* @layer shared-game @kind logic */
import { tileAttrsFor } from './tile-attrs-for';

const getAttrLabel = (attr: number, indoors = false): string => tileAttrsFor(indoors)[attr]?.labels[0] ?? 'unknown';

export { getAttrLabel };
