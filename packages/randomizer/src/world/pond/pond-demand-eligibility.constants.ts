/* @layer shared-game @kind constants */
import { all } from '@rotp/game-data';
import { PROGRESSIVE_FAMILIES } from '../progressive/progressive-families.constants';
import { isHoldableRecord } from './is-holdable-record';
import type { ItemKey } from '../item-ids';

const FAMILY_TIER_ITEMS: ReadonlySet<ItemKey> = new Set<ItemKey>(
  PROGRESSIVE_FAMILIES.flatMap((family) => family.tiers),
);

const HOLDABLE_RECORD_NAMES: ReadonlySet<string> = new Set(
  all('item').filter(isHoldableRecord).map((record) => record.name),
);

export { FAMILY_TIER_ITEMS, HOLDABLE_RECORD_NAMES };
