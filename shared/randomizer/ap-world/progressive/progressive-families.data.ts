/* @layer shared-game @kind data */
/**
 * The five tiered families, their pool item and the concrete tiers each copy
 * hands over, transcribed from Archipelago worlds/alttp/Items.py
 * (progression_mapping, lines 230-242) and ItemPool.py difficulties['normal']
 * (lines 99-130), which is the row set this app's pool is pinned to. The mail
 * family has no progression_mapping entry because its tiers are classed
 * useful rather than progression — no rule reads them — so it appears here
 * for the pool and the receipt ladder alone.
 *
 * Tier counts ARE the reference's normal-difficulty copy counts: four blades,
 * three shields, two mails, two gloves, two bows. That is why one tick per
 * tier is also one tick per pool copy — the two questions coincide at this
 * difficulty and the tick list can answer both.
 *
 * REPLACEMENT_ITEM is the reference's own stand-in for a copy that is not
 * there: swordless swaps the four blades for four twenty-rupee pickups
 * (ItemPool.py 76/108/140/172, `swordless=['Rupees (20)'] * 4`). Using it for
 * every family keeps the fixed 153-item pool size exactly as transcribed.
 */
import type { ProgressiveFamilyDef, ProgressiveFamilyId, ProgressiveSetting } from './progressive.type';

/** ItemPool.py 76 — what a missing copy leaves behind, so the pool size never moves. */
const REPLACEMENT_ITEM = 'Rupees (20)';

/** In the order the cards are shown. */
const PROGRESSIVE_FAMILIES: readonly ProgressiveFamilyDef[] = [
  {
    id: 'sword',
    label: 'Sword',
    poolItem: 'Progressive Sword',
    tiers: ['Fighter Sword', 'Master Sword', 'Tempered Sword', 'Golden Sword'],
    tierLabels: ['Fighter', 'Master', 'Tempered', 'Golden'],
  },
  {
    id: 'shield',
    label: 'Shield',
    poolItem: 'Progressive Shield',
    tiers: ['Blue Shield', 'Red Shield', 'Mirror Shield'],
    tierLabels: ['Blue', 'Red', 'Mirror'],
  },
  {
    id: 'mail',
    label: 'Mail',
    poolItem: 'Progressive Mail',
    tiers: ['Blue Mail', 'Red Mail'],
    tierLabels: ['Blue', 'Red'],
  },
  {
    id: 'glove',
    label: 'Glove',
    poolItem: 'Progressive Glove',
    tiers: ['Power Glove', 'Titans Mitts'],
    tierLabels: ['Lift', 'Heavy lift'],
  },
  {
    id: 'bow',
    label: 'Bow',
    poolItem: 'Progressive Bow',
    tiers: ['Bow', 'Silver Bow'],
    tierLabels: ['Plain', 'Silver'],
  },
];

const PROGRESSIVE_FAMILY_IDS: readonly ProgressiveFamilyId[] =
  PROGRESSIVE_FAMILIES.map((family) => family.id);

const familyOfId = (id: ProgressiveFamilyId): ProgressiveFamilyDef => {
  const found = PROGRESSIVE_FAMILIES.find((family) => family.id === id);
  if (found === undefined) throw new Error(`no progressive family: ${id}`);
  return found;
};

/** Every tier ticked — the reference pool, and what an absent row reads as. */
const DEFAULT_PROGRESSIVE_SETTING: ProgressiveSetting = Object.fromEntries(
  PROGRESSIVE_FAMILIES.map((family) => [family.id, family.tiers.map(() => true)]),
) as unknown as ProgressiveSetting;

export {
  DEFAULT_PROGRESSIVE_SETTING,
  PROGRESSIVE_FAMILIES,
  PROGRESSIVE_FAMILY_IDS,
  REPLACEMENT_ITEM,
  familyOfId,
};
