/* @layer bridge-wasm @kind logic */
import { getItem, vanillaPrizeGrantIdOfName } from '@rotp/game-data';
import type { CheckRecord } from '@rotp/game-data';
import { BOSS_PRIZE_GRANT_ID, MAX_NATIVE_GRANT_ID } from './native-grant-id.constants';

const dungeonRewardGrantIdOf = (vanillaItem: string): number | undefined => {
  const record = getItem(vanillaItem);
  return record.gameId?.receiveItemId ?? vanillaPrizeGrantIdOfName(record.name);
};

const nativeGrantIdOf = (check: CheckRecord): number | undefined => {
  const { kind, gameId, vanillaItemIds } = check;
  if (kind === 'npc') {
    const { flagType, itemId } = gameId;
    if (flagType === undefined || itemId === undefined) return undefined;
    return itemId <= MAX_NATIVE_GRANT_ID ? itemId : undefined;
  }
  if (kind === 'boss') return BOSS_PRIZE_GRANT_ID;
  if (kind === 'prize') {
    const vanillaItem = vanillaItemIds[0];
    if (vanillaItem === undefined) return undefined;
    return dungeonRewardGrantIdOf(vanillaItem);
  }
  if (kind === 'standing' || kind === 'dig' || kind === 'bonk') {
    const vanillaItem = vanillaItemIds[0];
    if (vanillaItem === undefined) return undefined;
    const receiveId = getItem(vanillaItem).gameId?.receiveItemId;
    if (receiveId === undefined || receiveId > MAX_NATIVE_GRANT_ID) return undefined;
    return receiveId;
  }
  return undefined;
};

export { nativeGrantIdOf };
