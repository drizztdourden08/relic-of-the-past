/* @layer shared-game @kind logic */
/**
 * Every small key the dungeons own, handed over as a full ring.
 *
 * The tracker's "Small Keys" switch is answered the way the Big Keys one is: by putting the
 * keys in the state's hands instead of rewriting the rules. A rule counts keys FOUND, and a
 * player standing past a locked door has already spent some, so the count can say a room is
 * out of reach while the player is in it. With the switch off every key door reads as open.
 */
import { DUNGEON_ORDER } from './fill/dungeon-order.data';
import { worldDungeonOf } from './world-dungeon';
import type { ItemId } from '@shared/game/data/types/ids';

/** The most small keys any rule asks for: the upper floors of Ganon's Tower ask for eight. */
const MOST_KEYS_ASKED = 8;

const SMALL_KEY_ITEMS: readonly ItemId[] = DUNGEON_ORDER.map((id) => worldDungeonOf(id).smallKey);

/** Each dungeon's small key, as many times as any rule could count it. */
const fullKeyRing = (): ItemId[] =>
  SMALL_KEY_ITEMS.flatMap((key) => Array.from({ length: MOST_KEYS_ASKED }, () => key));

export { fullKeyRing, SMALL_KEY_ITEMS };
