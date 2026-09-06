/* @layer bridge-wasm @kind logic */
/**
 * Targeted dungeon-item gate: JS-side arming for the in-core receipt seams
 * (core/game-hooks/dungeon_item_grants.c), which redirect a key, big key, map
 * or compass to the dungeon its assigned id names instead of the one the
 * player is standing in.
 *
 * There is no table of its own here: the target travels in the receive id, so
 * every substitution table and the delivery export already carry it. This bit
 * only tells the core that those ids are live, which is what licenses the two
 * redirected writes inside the receipt.
 *
 * Armed at session START and disarmed at stop, like the receipt gates rather
 * than like the plan-scanned prize bit: an online session is handed an
 * assigned item by the server at any moment, with no plan row behind it, so
 * the seam has to be open for the whole session.
 */

import { log } from '../log-bus';
import { setDungeonItemGrantsActive } from './live-settings-flags';
import { reassertGateWord3 } from './live-settings';

const armDungeonItemGrants = (): void => {
  setDungeonItemGrantsActive(true);
  reassertGateWord3();
  log.randomizer('[Randomizer] Dungeon item grants armed: an assigned key or map credits its own dungeon');
};

const disarmDungeonItemGrants = (): void => {
  setDungeonItemGrantsActive(false);
  reassertGateWord3();
};

export { armDungeonItemGrants, disarmDungeonItemGrants };
