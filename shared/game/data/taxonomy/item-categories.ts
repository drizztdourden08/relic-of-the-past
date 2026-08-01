/* @layer shared-game @kind data */
/** Item category taxonomy — our own grouping, not a game secret. */

type ItemCategory = 'weapon' | 'equipment' | 'medallion' | 'bottle' | 'upgrade' | 'crystal' | 'event' | 'junk' | 'key';

const ITEM_CATEGORY_LABELS: Record<ItemCategory, string> = {
  weapon: 'Weapon',
  equipment: 'Equipment',
  medallion: 'Medallion',
  bottle: 'Bottle',
  upgrade: 'Upgrade',
  crystal: 'Crystal',
  event: 'Event',
  junk: 'Junk',
  key: 'Key',
};

export { ITEM_CATEGORY_LABELS };
export type { ItemCategory };
