/* @layer shared-game @kind logic */
/**
 * The weapons a given inventory can bring to bear against a sprite, with each
 * one's ancilla type (or null for the sword, which is not an ancilla), its
 * resolved damage class, and its reach. Thrown bombs are NOT modelled here —
 * their parabolic travel distance was not pinned down; only the placed
 * (contact) bomb is represented.
 */
import { itemLabel } from '../../items';
import type { CombatTables } from '../types';
import type { Weapon } from './enemy-reach';

/** Contact reach, in tiles, for the sword and the placed bomb. */
const CONTACT_RADIUS = 2;

/** kSprite_Func14_Damage base entries (sprite.c), indexed by sword tier - 1.
 *  Swing-timing adjustments on top of these are not modelled. */
const SWORD_BASE_DAMAGE_CLASS = [1, 2, 3, 4];

/** Sword item ids in tier order. Identity is the id; the name is only looked up
 *  because the inventory this is matched against is a set of display names. */
const SWORD_TIER_IDS = [0x49, 0x01, 0x02, 0x03];
const SWORD_TIER_NAMES = SWORD_TIER_IDS.map((id) => itemLabel(id));

/** Ancilla type for the sword beam (needs a sword above tier 1). Its
 *  near-full-health firing condition is not modelled — the beam is offered
 *  whenever the sword requirement is met. */
const SWORD_BEAM_ANCILLA = 0x0c;

/** Ancilla-borne weapons keyed by the inventory item name that unlocks them. */
const ANCILLA_WEAPONS: ReadonlyArray<{ item: string; ancillaType: number; travel: number; label: string }> = [
  { item: 'Bow', ancillaType: 0x09, travel: Infinity, label: 'bow' },
  { item: 'Blue Boomerang', ancillaType: 0x05, travel: 8, label: 'boomerang' },
  { item: 'Red Boomerang', ancillaType: 0x05, travel: 36, label: 'boomerang' },
  { item: 'Hookshot', ancillaType: 0x1f, travel: 16, label: 'hookshot' },
  { item: 'Fire Rod', ancillaType: 0x02, travel: Infinity, label: 'fire rod' },
  { item: 'Ice Rod', ancillaType: 0x0b, travel: Infinity, label: 'ice rod' },
];

/** True when some inventory entry names this sword tier. The uncle's gift is
 *  tracked as the combined 'Fighter Sword & Shield' grant (item 0x00, id-map.ts)
 *  rather than the bare 'Fighter Sword' name (item 0x49) that a tier-1 sword
 *  found on its own would carry — so this looks for the tier name as a
 *  substring of an entry rather than requiring an exact match. */
const hasSwordTier = (inventory: Set<string>, name: string): boolean =>
  [...inventory].some((entry) => entry.includes(name));

/** Highest sword tier (1-4) present in the inventory, 0 when swordless. */
const swordTier = (inventory: Set<string>): number =>
  SWORD_TIER_NAMES.reduce((tier, name, i) => (hasSwordTier(inventory, name) ? i + 1 : tier), 0);

/** damageByClass is indexed by damage class, not ancilla type — this is the
 *  ancilla -> damage-class step of the game's two-step lookup. */
const damageClassFor = (ancillaType: number, tables: CombatTables): number => tables.ancillaDamageClass[ancillaType] ?? 0;

/** Every weapon the inventory can bring to bear, with damage classes resolved
 *  against the shared ancilla table. */
const weaponsFor = (inventory: Set<string>, tables: CombatTables): Weapon[] => {
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
  if (inventory.has('Bombs')) {
    weapons.push({ ancillaType: 0x07, damageClass: damageClassFor(0x07, tables), kind: 'contact', travel: CONTACT_RADIUS, label: 'bomb' });
  }
  for (const w of ANCILLA_WEAPONS) {
    if (!inventory.has(w.item)) continue;
    weapons.push({ ancillaType: w.ancillaType, damageClass: damageClassFor(w.ancillaType, tables), kind: 'travelling', travel: w.travel, label: w.label });
  }
  return weapons;
};

export { weaponsFor, swordTier, CONTACT_RADIUS };
