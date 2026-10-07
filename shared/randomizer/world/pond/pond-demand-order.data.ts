/* @layer shared-game @kind data */

import { ITEM } from '../item-ids.data';
import type { ItemId } from '@shared/game/data/types/ids';

/**
 * How early in a run each demandable item turns up, for the curve an item
 * demand climbs (pond-demand-item.ts).
 *
 * The roll runs BEFORE the fill, so this seed's own spheres do not exist yet
 * and cannot be the measure. What is fixed ahead of any seed is the order the
 * unmodified game hands these items over along its standard route: the
 * castle escape, the three pendants, then the seven crystals. That order is
 * the one shared sense of "early" and "late" a player carries into a seed.
 * A seed moves every item, so this is a prior, the same kind of guess the
 * old copy count was, but one that means something for items held once.
 *
 * Order is position in this list, first to last. A family's pool item stands
 * where its FIRST rung is handed over, because a demand for it asks for that
 * rung or better. An eligible name missing from the list ranks after every
 * listed one (the keep test pins that the list covers them all).
 */

const DEMAND_ITEM_ORDER: readonly ItemId[] = [
  // The castle escape.
  ITEM.lamp,
  ITEM.progressiveSword,
  ITEM.progressiveShield,
  // The pendants.
  ITEM.progressiveBow,
  ITEM.greenPendant,
  ITEM.pegasusBoots,
  ITEM.bookOfMudora,
  ITEM.progressiveGlove,
  ITEM.bluePendant,
  ITEM.iceRod,
  ITEM.bugCatchingNet,
  ITEM.magicMirror,
  ITEM.moonPearl,
  ITEM.redPendant,
  ITEM.flippers,
  ITEM.ether,
  // The crystals.
  ITEM.hammer,
  ITEM.crystal1,
  ITEM.hookshot,
  ITEM.crystal2,
  ITEM.fireRod,
  ITEM.crystal3,
  ITEM.cape,
  ITEM.bombos,
  ITEM.crystal4,
  ITEM.quake,
  ITEM.progressiveMail,
  ITEM.crystal5,
  ITEM.caneOfSomaria,
  ITEM.crystal6,
  ITEM.caneOfByrna,
  ITEM.crystal7,
];

/** Name → its place in the run, first item 0. */
const DEMAND_ITEM_RANK: ReadonlyMap<ItemId, number> = new Map(
  DEMAND_ITEM_ORDER.map((item, index) => [item, index]),
);

export { DEMAND_ITEM_ORDER, DEMAND_ITEM_RANK };
