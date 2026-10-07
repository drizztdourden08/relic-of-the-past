/* @layer shared-game @kind data */
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

const DEMAND_ITEM_ORDER: readonly string[] = [
  // The castle escape.
  'Lamp',
  'Progressive Sword',
  'Progressive Shield',
  // The pendants.
  'Progressive Bow',
  'Green Pendant',
  'Pegasus Boots',
  'Book of Mudora',
  'Progressive Glove',
  'Blue Pendant',
  'Ice Rod',
  'Bug Catching Net',
  'Magic Mirror',
  'Moon Pearl',
  'Red Pendant',
  'Flippers',
  'Ether',
  // The crystals.
  'Hammer',
  'Crystal 1',
  'Hookshot',
  'Crystal 2',
  'Fire Rod',
  'Crystal 3',
  'Cape',
  'Bombos',
  'Crystal 4',
  'Quake',
  'Progressive Mail',
  'Crystal 5',
  'Cane of Somaria',
  'Crystal 6',
  'Cane of Byrna',
  'Crystal 7',
];

/** Name → its place in the run, first item 0. */
const DEMAND_ITEM_RANK: ReadonlyMap<string, number> = new Map(
  DEMAND_ITEM_ORDER.map((name, index) => [name, index]),
);

export { DEMAND_ITEM_ORDER, DEMAND_ITEM_RANK };
