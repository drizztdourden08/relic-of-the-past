/* @layer shared-game @kind logic */
import { FLOOR_ATTR } from './tile-attrs.constants';
import { isDoorPassageAttr } from './is-door-passage-attr';

const isPassableAttr = (attr: number): boolean => attr === FLOOR_ATTR || isDoorPassageAttr(attr);

export { isPassableAttr };
