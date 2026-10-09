/* @layer shared-game @kind data */
import { ITEM, UNRECORDED } from '../item-ids';
import type { ItemId } from '@rotp/game-data';
import type { ItemKey } from '../item-ids';
import type { RetroBowSetting } from './retro.type';

const RETRO_BOW_KEY = 'retro_bow';
const RETRO_WOOD_COST_KEY = 'retro_arrow_cost_wood';
const RETRO_SILVER_COST_KEY = 'retro_arrow_cost_silver';

const RETRO_WOOD_ARROW_COST = 10;

const RETRO_SILVER_ARROW_COST = 50;

const RETRO_QUIVER_PRICE = 80;

const RETRO_PRICE_CEILING = 999;

const RETRO_ARROW_PICKUPS: readonly ItemId[] = [ITEM.singleArrow, ITEM.arrows10];

const RETRO_REPLACEMENT_ITEM = ITEM.rupees5;

const RETRO_QUIVER_ITEM: ItemKey = UNRECORDED.quiver;

const RETRO_QUIVER_GRANT_ITEM: ItemId = ITEM.singleArrow;

const DEFAULT_RETRO_BOW: RetroBowSetting = {
  enabled: false,
  woodArrowCost: RETRO_WOOD_ARROW_COST,
  silverArrowCost: RETRO_SILVER_ARROW_COST,
};

export {
  DEFAULT_RETRO_BOW,
  RETRO_ARROW_PICKUPS,
  RETRO_BOW_KEY,
  RETRO_PRICE_CEILING,
  RETRO_QUIVER_GRANT_ITEM,
  RETRO_QUIVER_ITEM,
  RETRO_QUIVER_PRICE,
  RETRO_REPLACEMENT_ITEM,
  RETRO_SILVER_ARROW_COST,
  RETRO_SILVER_COST_KEY,
  RETRO_WOOD_ARROW_COST,
  RETRO_WOOD_COST_KEY,
};
