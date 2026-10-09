/* @layer tests @kind constants */
import type { CheckId, ItemId } from '../../../shared/game/data';

const KAKARIKO_TAVERN_ROOM = 0x103;
const LINKS_HOUSE_ROOM = 0x104;
const CHICKEN_HOUSE_ROOM = 0x108;
const BOMBS_ID = 0x28;
const LAMP_ID = 0x12;
const HOUSE_CHECK: CheckId = 'check-026';
const SMALL_KEY: ItemId = 'item-037';
const BIG_KEY: ItemId = 'item-051';
const STEP_LIMIT = 500;

export {
  BIG_KEY, BOMBS_ID, CHICKEN_HOUSE_ROOM, HOUSE_CHECK, KAKARIKO_TAVERN_ROOM, LAMP_ID, LINKS_HOUSE_ROOM, SMALL_KEY,
  STEP_LIMIT,
};
