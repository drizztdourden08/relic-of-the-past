/* @layer shared-game @kind constants */
import { DUNGEON_ORDER } from '../fill/dungeon-order.constants';
import { worldDungeonOf } from '../world-dungeon';
import type { ItemId } from '@rotp/game-data';

const BIG_KEY_ITEMS: readonly ItemId[] = DUNGEON_ORDER
  .map((id) => worldDungeonOf(id).bigKey)
  .filter((id): id is ItemId => id !== null);

export { BIG_KEY_ITEMS };
