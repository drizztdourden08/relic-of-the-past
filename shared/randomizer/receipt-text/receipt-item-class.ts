/* @layer shared-game @kind logic */
/**
 * Receipt item classification — sorts a community-standard item name into the
 * contextual message class its receipt line is rendered from. Progressive and
 * dungeon-restricted items are recognized from the standard name's own shape;
 * a capacity upgrade is recognized from the name tables (the name carries its
 * family and jump, so no session table is needed here) — a progressive
 * capacity item before the progressive-equipment prefix, since its name
 * starts the same way but its jump is the plan's, not the name's; junk is
 * everything the reference item table classifies as filler (neither
 * progression nor useful — item-classes.data.ts).
 */

import { upgradeItemOfName } from '@shared/game/data/capacity-upgrade-item';
import { progressiveCapacityFamilyOf } from '@shared/game/data/capacity-progressive-item';
import { PROGRESSION_ITEMS, USEFUL_ITEMS } from '../ap-world/pool/item-classes.data';
import type { CapacityFamilyId } from '@shared/game/data/capacity-family.type';

const PROGRESSIVE_PREFIX = 'Progressive ';

/** "Small Key (Palace Name)" style dungeon-restricted items. */
const DUNGEON_ITEM_RE = /^(Small Key|Big Key|Map|Compass) \((.+)\)$/;

type DungeonPiece = 'small-key' | 'big-key' | 'map' | 'compass';

type ReceiptItemClass =
  | { kind: 'progressive'; slot: string }
  | { kind: 'dungeon-item'; piece: DungeonPiece; base: string; dungeon: string }
  | { kind: 'capacity'; family: CapacityFamilyId; jump: number }
  | { kind: 'capacity-progressive'; family: CapacityFamilyId }
  | { kind: 'junk' }
  | { kind: 'standard' };

const PIECE_BY_BASE: Readonly<Record<string, DungeonPiece>> = {
  'Small Key': 'small-key',
  'Big Key': 'big-key',
  Map: 'map',
  Compass: 'compass',
};

const classifyReceiptItem = (itemName: string): ReceiptItemClass => {
  const progressiveFamily = progressiveCapacityFamilyOf(itemName);
  if (progressiveFamily !== undefined) return { kind: 'capacity-progressive', family: progressiveFamily };
  if (itemName.startsWith(PROGRESSIVE_PREFIX)) {
    return { kind: 'progressive', slot: itemName.slice(PROGRESSIVE_PREFIX.length) };
  }
  const dungeonMatch = DUNGEON_ITEM_RE.exec(itemName);
  if (dungeonMatch !== null) {
    const [, base, dungeon] = dungeonMatch;
    return { kind: 'dungeon-item', piece: PIECE_BY_BASE[base], base, dungeon };
  }
  const upgrade = upgradeItemOfName(itemName);
  if (upgrade !== undefined) return { kind: 'capacity', family: upgrade.family, jump: upgrade.jump };
  if (!PROGRESSION_ITEMS.has(itemName) && !USEFUL_ITEMS.has(itemName)) return { kind: 'junk' };
  return { kind: 'standard' };
};

export { classifyReceiptItem };
export type { DungeonPiece, ReceiptItemClass };
