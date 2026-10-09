/* @layer bridge-wasm @kind logic */
import { getCheck } from '@rotp/game-data';
import {
  BONK_KEY_ROOMS, DASH_ITEM_SPRITE, DUNGEON_KEY_ITEM_ID, HALF_ANY, HALF_BY_MASK, HALF_FALLBACK_BY_ROOM,
  HEART_PIECE_ITEM_ID, PRIZE_SPRITE,
} from './standing-override-key.constants';
import { isWorldItemKind } from './is-world-item-kind';
import type { CheckId, CheckRecord } from '@rotp/game-data';
import type { StandingOverrideTarget } from '../../standing-overrides/standing-overrides.type';

const indoorHalfOf = (check: CheckRecord): number => {
  const { roomId, mask } = check.gameId;
  if (mask !== undefined && HALF_BY_MASK[mask] !== undefined) return HALF_BY_MASK[mask];
  if (roomId !== undefined && HALF_FALLBACK_BY_ROOM[roomId] !== undefined) return HALF_FALLBACK_BY_ROOM[roomId];
  return HALF_ANY;
};

const standingOverrideKeyOf = (checkId: CheckId): StandingOverrideTarget | null => {
  const check = getCheck(checkId);
  if (!isWorldItemKind(check)) return null;
  const vanillaItem = check.vanillaItemIds[0];
  const { owScreen, roomId } = check.gameId;
  if (vanillaItem === HEART_PIECE_ITEM_ID) {
    if (owScreen !== undefined) return { area: owScreen, indoors: false, sprite: PRIZE_SPRITE, half: HALF_ANY };
    if (roomId !== undefined) return { area: roomId, indoors: true, sprite: PRIZE_SPRITE, half: indoorHalfOf(check) };
    return null;
  }
  if (vanillaItem === DUNGEON_KEY_ITEM_ID && roomId !== undefined && BONK_KEY_ROOMS.has(roomId)) {
    return { area: roomId, indoors: true, sprite: DASH_ITEM_SPRITE, half: HALF_ANY };
  }
  return null;
};

export { standingOverrideKeyOf };
