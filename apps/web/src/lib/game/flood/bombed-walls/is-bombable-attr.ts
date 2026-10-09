/* @layer bridge-wasm @kind logic */
import { BOMBABLE_ATTR_MAX, BOMBABLE_ATTR_MIN } from './bombed-walls.constants';

const isBombableAttr = (attr: number): boolean => attr >= BOMBABLE_ATTR_MIN && attr <= BOMBABLE_ATTR_MAX;

export { isBombableAttr };
