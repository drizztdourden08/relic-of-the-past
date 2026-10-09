/* @layer shared-game @kind constants */
import { ITEM } from '../../item-ids';
import { PROGRESSIVE_FAMILIES } from '../progressive-families.constants';
import type { ItemId } from '@rotp/game-data';
import type { ProgressiveFamilyId } from '../progressive.type';

const FAMILY_OF_POOL_ITEM: ReadonlyMap<ItemId, ProgressiveFamilyId> = new Map([
  ...PROGRESSIVE_FAMILIES.map((family): [ItemId, ProgressiveFamilyId] => [family.poolItem, family.id]),
  [ITEM.progressiveBowAlt, 'bow'],
]);

export { FAMILY_OF_POOL_ITEM };
