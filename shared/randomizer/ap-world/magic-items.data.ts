/* @layer shared-game @kind data */
/**
 * The items whose every use spends the meter: the light source, both rods,
 * the cloak, both canes, the three medallions and the powder. On the meter
 * ladder's empty rung (no magic at all) owning one of these grants nothing,
 * so the collection state reports them absent there (item-usability.ts).
 * Meter level items themselves are not listed — they are what lifts the
 * family off that rung.
 */
import { ITEM } from './item-names.data';

const METER_CONSUMING_ITEMS: ReadonlySet<string> = new Set([
  ITEM.lamp,
  ITEM.fireRod,
  ITEM.iceRod,
  'Cape',
  ITEM.caneOfSomaria,
  ITEM.caneOfByrna,
  ITEM.bombos,
  'Ether',
  ITEM.quake,
  'Magic Powder',
]);

export { METER_CONSUMING_ITEMS };
