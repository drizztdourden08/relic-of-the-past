/* @layer bridge-wasm @kind logic */
import { getItem, vanillaPrizeGrantIdOfName } from '@rotp/game-data';
import type { CheckRecord } from '@rotp/game-data';
import { BOSS_PRIZE_GRANT_ID, MAX_NATIVE_GRANT_ID } from './native-grant-id.constants';

const dungeonRewardGrantIdOf = (vanillaItem: string): number | undefined => {
  const record = getItem(vanillaItem);
  return record.gameId?.receiveItemId ?? vanillaPrizeGrantIdOfName(record.name);
};

const npcGrantIdOf = (gameId: CheckRecord['gameId']): number | undefined => {
  const { flagType, itemId } = gameId;
  if (flagType === undefined || itemId === undefined) return undefined;
  return itemId <= MAX_NATIVE_GRANT_ID ? itemId : undefined;
};

const worldItemGrantIdOf = (vanillaItem: string): number | undefined => {
  const receiveId = getItem(vanillaItem).gameId?.receiveItemId;
  if (receiveId === undefined || receiveId > MAX_NATIVE_GRANT_ID) return undefined;
  return receiveId;
};

const nativeGrantIdOf = (check: CheckRecord): number | undefined => {
  const { kind, gameId, vanillaItemIds } = check;
  if (kind === 'npc') return npcGrantIdOf(gameId);
  if (kind === 'boss') return BOSS_PRIZE_GRANT_ID;
  const vanillaItem = vanillaItemIds[0];
  if (kind === 'prize') return vanillaItem === undefined ? undefined : dungeonRewardGrantIdOf(vanillaItem);
  if (kind === 'standing' || kind === 'dig' || kind === 'bonk') {
    return vanillaItem === undefined ? undefined : worldItemGrantIdOf(vanillaItem);
  }
  return undefined;
};

export { nativeGrantIdOf };
