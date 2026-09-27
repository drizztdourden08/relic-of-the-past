/* @layer shared-game @kind logic */
/**
 * Every big key the dungeons own, by id, read off the dungeon records.
 *
 * The tracker's "Big Key doors" switch is answered by handing these to the state instead of by
 * rewriting the rules: a door whose key is in hand is open, which is the same reading as the
 * door not being there, and it needs no second version of any rule to say so.
 */
import { DUNGEON_ORDER } from './fill/dungeon-order.data';
import { worldDungeonOf } from './world-dungeon';
import type { ItemId } from '@shared/game/data/types/ids';

const BIG_KEY_ITEMS: readonly ItemId[] = DUNGEON_ORDER
  .map((id) => worldDungeonOf(id).bigKey)
  .filter((id): id is ItemId => id !== null);

export { BIG_KEY_ITEMS };
