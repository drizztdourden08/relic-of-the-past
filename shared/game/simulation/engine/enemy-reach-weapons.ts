/* @layer shared-game @kind logic */
/**
 * The weapons a given inventory can bring to bear against a sprite, with each
 * one's ancilla type (or null for the sword, which is not an ancilla), its
 * resolved damage class, and its reach. Thrown bombs are NOT modelled here,
 * because their parabolic travel distance was not pinned down; only the placed
 * (contact) bomb is represented.
 *
 * Every match is on an `ItemId`. This used to turn the sword ids into display
 * names and then ask whether any inventory entry CONTAINED one, which meant a
 * renamed record made the run silently swordless. The reason the substring
 * was there (the uncle's gift is a combined sword-and-shield record) had already
 * stopped applying, because the tracker's sword ladder adds every rung below the
 * one held, so the bare tier-1 sword is always in the set.
 */
import type { ItemId, RangeProfile } from '../../data';
import { getItem, ITEM_GROUP_IDS, membersOf } from '../../data';
import type { CombatTables } from '../types';
import type { Weapon } from './enemy-reach';

/** Contact reach, in tiles, for the sword and the placed bomb. */
const CONTACT_RADIUS = 2;

/** kSprite_Func14_Damage base entries (sprite.c), indexed by sword tier - 1.
 *  Swing-timing adjustments on top of these are not modelled. */
const SWORD_BASE_DAMAGE_CLASS = [1, 2, 3, 4];

/** Sword items in tier order, from the dataset's own group, which is already ordered
 *  weakest-first, so no local copy of the tier list exists to drift from it. */
const SWORD_TIER_IDS: readonly ItemId[] = membersOf(ITEM_GROUP_IDS.Swords);

/** Ancilla type for the sword beam (needs a sword above tier 1). Its
 *  near-full-health firing condition is not modelled, so the beam is offered
 *  whenever the sword requirement is met. */
const SWORD_BEAM_ANCILLA = 0x0c;

/** The bomb pickup stands in for "carries bombs", since no record expresses bomb
 *  capacity (same gap the traversal-token table documents). */
const BOMB_ITEM_ID: ItemId = 'item-041';
const PLACED_BOMB_ANCILLA = 0x07;

/**
 * Ancilla-borne weapons, by the item that unlocks them. The ancilla type and the
 * travel distance come from that item's own `weapon` profile, so the combat facts
 * live on the record; only the short log label is stated here.
 */
const ANCILLA_WEAPONS: ReadonlyArray<{ itemId: ItemId; label: string }> = [
  { itemId: 'item-012', label: 'bow' },
  { itemId: 'item-013', label: 'boomerang' },
  { itemId: 'item-043', label: 'boomerang' },
  { itemId: 'item-011', label: 'hookshot' },
  { itemId: 'item-008', label: 'fire rod' },
  { itemId: 'item-009', label: 'ice rod' },
];

/** Highest sword tier (1-4) present in the inventory, 0 when swordless. */
const swordTier = (inventory: ReadonlySet<ItemId>): number =>
  SWORD_TIER_IDS.reduce((tier, id, i) => (inventory.has(id) ? i + 1 : tier), 0);

/** damageByClass is indexed by damage class, not ancilla type. This is the
 *  ancilla -> damage-class step of the game's two-step lookup. */
const damageClassFor = (ancillaType: number, tables: CombatTables): number => tables.ancillaDamageClass[ancillaType] ?? 0;

/** How far this weapon's projectile travels, from the record's range profile. */
const travelOf = (range: RangeProfile): number =>
  range.kind === 'unbounded' ? Infinity : range.tiles;

/** Every weapon the inventory can bring to bear, with damage classes resolved
 *  against the shared ancilla table. */
const weaponsFor = (inventory: ReadonlySet<ItemId>, tables: CombatTables): Weapon[] => {
  const weapons: Weapon[] = [];
  const tier = swordTier(inventory);
  if (tier > 0) {
    weapons.push({
      ancillaType: null,
      damageClass: SWORD_BASE_DAMAGE_CLASS[tier - 1],
      kind: 'contact',
      travel: CONTACT_RADIUS,
      label: 'sword',
    });
  }
  if (tier > 1) {
    weapons.push({
      ancillaType: SWORD_BEAM_ANCILLA,
      damageClass: damageClassFor(SWORD_BEAM_ANCILLA, tables),
      kind: 'travelling',
      travel: Infinity,
      label: 'sword beam',
    });
  }
  if (inventory.has(BOMB_ITEM_ID)) {
    weapons.push({ ancillaType: PLACED_BOMB_ANCILLA, damageClass: damageClassFor(PLACED_BOMB_ANCILLA, tables), kind: 'contact', travel: CONTACT_RADIUS, label: 'bomb' });
  }
  for (const { itemId, label } of ANCILLA_WEAPONS) {
    if (!inventory.has(itemId)) continue;
    const profile = getItem(itemId).weapon;
    if (!profile) continue;
    weapons.push({
      ancillaType: profile.ancillaType,
      damageClass: damageClassFor(profile.ancillaType, tables),
      kind: 'travelling',
      travel: travelOf(profile.range),
      label,
    });
  }
  return weapons;
};

export { weaponsFor, swordTier, CONTACT_RADIUS, BOMB_ITEM_ID };
