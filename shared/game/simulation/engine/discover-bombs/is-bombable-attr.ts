/* @layer shared-game @kind logic */
import { BOMBABLE_ATTR_MAX, BOMBABLE_ATTR_MIN } from './discover-bombs.constants';

const isBombableAttr = (attr: number): boolean => attr >= BOMBABLE_ATTR_MIN && attr <= BOMBABLE_ATTR_MAX;

export { isBombableAttr };
