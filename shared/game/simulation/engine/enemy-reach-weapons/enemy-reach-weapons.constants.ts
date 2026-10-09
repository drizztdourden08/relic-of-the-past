/* @layer shared-game @kind constants */
import type { ItemId } from '../../../data';
import { ITEM_GROUP_IDS, membersOf } from '../../../data';
import type { AncillaWeapon } from './enemy-reach-weapons.type';

const CONTACT_RADIUS = 2;

const SWORD_BASE_DAMAGE_CLASS = [1, 2, 3, 4];

const SWORD_TIER_IDS: readonly ItemId[] = membersOf(ITEM_GROUP_IDS.Swords);

const SWORD_BEAM_ANCILLA = 0x0c;

const BOMB_ITEM_ID: ItemId = 'item-041';
const PLACED_BOMB_ANCILLA = 0x07;

const ANCILLA_WEAPONS: ReadonlyArray<AncillaWeapon> = [
  { itemId: 'item-012', label: 'bow' },
  { itemId: 'item-013', label: 'boomerang' },
  { itemId: 'item-043', label: 'boomerang' },
  { itemId: 'item-011', label: 'hookshot' },
  { itemId: 'item-008', label: 'fire rod' },
  { itemId: 'item-009', label: 'ice rod' },
];

export {
  CONTACT_RADIUS,
  SWORD_BASE_DAMAGE_CLASS,
  SWORD_TIER_IDS,
  SWORD_BEAM_ANCILLA,
  BOMB_ITEM_ID,
  PLACED_BOMB_ANCILLA,
  ANCILLA_WEAPONS,
};
