/* @layer bridge-wasm @kind logic */
import { STANDING_ITEM_IDS } from './sprite-kinds.constants';

const standingItemId = (spriteType: number): number | undefined => STANDING_ITEM_IDS[spriteType];

export { standingItemId };
