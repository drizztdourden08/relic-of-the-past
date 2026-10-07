/* @layer shared-game @kind data */
/**
 * What a copy of a family's pool item hands over, by rung.
 *
 * Ported from Archipelago worlds/alttp/Items.py progression_mapping, inverted: collecting the
 * Nth copy of a progressive base item also grants the Nth concrete tier. The rungs are the
 * families' own (progressive-families.data.ts), so nothing is written twice. The alternate bow
 * row rides the same ladder as the main one, exactly as the source map has it.
 *
 * The mail family is absent on purpose: its tiers are classed useful, not progression, so the
 * source never expands a mail pickup into one and no rule reads a mail rung.
 */
import { ITEM } from '../item-ids.data';
import { PROGRESSIVE_FAMILIES } from './progressive-families.data';
import type { ItemId } from '@shared/game/data/types/ids';

const BOW_TIERS: readonly ItemId[] = PROGRESSIVE_FAMILIES
  .filter((family) => family.id === 'bow')
  .flatMap((family) => family.tiers);

const PROGRESSION_TIERS: ReadonlyMap<ItemId, readonly ItemId[]> = new Map([
  ...PROGRESSIVE_FAMILIES
    .filter((family) => family.id !== 'mail')
    .map((family): [ItemId, readonly ItemId[]] => [family.poolItem, family.tiers]),
  [ITEM.progressiveBowAlt, BOW_TIERS] as [ItemId, readonly ItemId[]],
]);

export { PROGRESSION_TIERS };
