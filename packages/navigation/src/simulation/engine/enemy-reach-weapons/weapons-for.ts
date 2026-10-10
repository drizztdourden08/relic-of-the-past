/* @layer shared-game @kind logic */
import type { ItemId, RangeProfile } from '@rotp/game-data';
import { getItem } from '@rotp/game-data';
import type { CombatTables } from '../../types';
import type { Weapon } from '../enemy-reach/enemy-reach.type';
import {
  ANCILLA_WEAPONS,
  BOMB_ITEM_ID,
  CONTACT_RADIUS,
  PLACED_BOMB_ANCILLA,
  SWORD_BASE_DAMAGE_CLASS,
  SWORD_BEAM_ANCILLA,
} from './enemy-reach-weapons.constants';
import { swordTier } from './sword-tier';
import { itemAt } from '../../../checked-access';

const damageClassFor = (ancillaType: number, tables: CombatTables): number => tables.ancillaDamageClass[ancillaType] ?? 0;

const travelOf = (range: RangeProfile): number =>
  range.kind === 'unbounded' ? Infinity : range.tiles;

const swordWeapons = (tier: number, tables: CombatTables): Weapon[] => {
  const weapons: Weapon[] = [];
  if (tier > 0) {
    weapons.push({
      ancillaType: null,
      damageClass: itemAt(SWORD_BASE_DAMAGE_CLASS, tier - 1),
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
  return weapons;
};

const weaponsFor = (inventory: ReadonlySet<ItemId>, tables: CombatTables): Weapon[] => {
  const weapons = swordWeapons(swordTier(inventory), tables);
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

export { weaponsFor };
