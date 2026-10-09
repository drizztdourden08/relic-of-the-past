/* @layer shared-game @kind constants */
import { DUNGEON_ORDER } from '../fill/dungeon-order.constants';
import { worldDungeonOf } from '../world-dungeon';
import type { ItemId } from '@rotp/game-data';

const MOST_KEYS_ASKED = 8;

const SMALL_KEY_ITEMS: readonly ItemId[] = DUNGEON_ORDER.map((id) => worldDungeonOf(id).smallKey);

export { MOST_KEYS_ASKED, SMALL_KEY_ITEMS };
