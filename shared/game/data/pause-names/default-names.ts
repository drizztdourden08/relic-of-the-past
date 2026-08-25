/* @layer shared-game @kind data */
/**
 * Seed NameTable for the enhanced pause menu — the English display strings
 * currently hardcoded in PauseMenuView, reattached to their ItemRecord ids so
 * a language set can retitle them. Item keys are `<item-record-id>-<tier>`
 * (tier is 1-based; tier 1 = the base pickup). Multi-word values are stored
 * as a single space-joined string; line breaking is derived at render time.
 */
import type { NameTable } from '@shared/game/language/types';

const defaultPauseNames: NameTable = {
  items: {
    'item-012-1': 'BOW',
    'item-012-2': 'BOW & SILVER ARROWS',
    'item-013-1': 'BOOMERANG',
    'item-011-1': 'HOOKSHOT',
    'item-041-1': 'BOMB',
    'item-042-1': 'MUSHROOM',
    'item-014-1': 'MAGIC POWDER',
    'item-008-1': 'FIRE ROD',
    'item-009-1': 'ICE ROD',
    'item-016-1': 'BOMBOS',
    'item-017-1': 'ETHER',
    'item-018-1': 'QUAKE',
    'item-019-1': 'LAMP',
    'item-010-1': 'MAGIC HAMMER',
    'item-020-1': 'SHOVEL',
    'item-021-1': 'FLUTE',
    'item-034-1': 'BUG NET',
    'item-030-1': 'BOOK OF MUDORA',
    'item-023-1': 'BOTTLE',
    'item-022-1': 'CANE OF SOMARIA',
    'item-025-1': 'CANE OF BYRNA',
    'item-026-1': 'MAGIC CAPE',
    'item-027-1': 'MAGIC MIRROR',
  },
  bottles: {
    2: 'BOTTLE',
    3: 'RED POTION',
    4: 'GREEN POTION',
    5: 'BLUE POTION',
    6: 'FAIRY',
    7: 'BEE',
    8: 'GOOD BEE',
  },
  labels: {
    item: 'ITEM',
    equipment: 'EQUIPMENT',
    'dungeon-item': 'DUNGEON ITEM',
    crystals: 'CRYSTALS',
    pendants: 'PENDANTS',
    do: 'DO',
  },
};

export { defaultPauseNames };
