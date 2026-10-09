/* @layer shared-game @kind logic */
import type { CheckRecord, ItemRecord } from '@rotp/game-data';
import type { CensusFindings, ChestMismatch, RomCensus, VanillaItemDiff } from './rom-census.type';

const censusFindings = (
  census: RomCensus,
  checks: readonly CheckRecord[],
  items: readonly ItemRecord[],
): CensusFindings => {
  const receiveIdByItemId = new Map<string, number | null>();
  for (const item of items) {
    receiveIdByItemId.set(item.id, item.gameId?.receiveItemId ?? null);
  }

  const chestMismatches: ChestMismatch[] = [];
  const vanillaItemDiffs: VanillaItemDiff[] = [];

  for (const check of checks) {
    if (check.kind !== 'chest') continue;
    const { roomId, chestIndex } = check.gameId;

    if (roomId === undefined || chestIndex === undefined) {
      chestMismatches.push({
        checkId: check.id, name: check.name,
        roomId: roomId ?? null, chestIndex: chestIndex ?? null,
        reason: 'missing roomId/chestIndex in gameId',
      });
      continue;
    }

    const romChest = census.chestsByRoom.get(roomId)?.find((c) => c.chestIndex === chestIndex);
    if (!romChest) {
      chestMismatches.push({
        checkId: check.id, name: check.name, roomId, chestIndex,
        reason: 'no chest at (roomId, chestIndex) in the native table',
      });
      continue;
    }

    const firstVanillaId = check.vanillaItemIds[0];
    const datasetReceiveId = firstVanillaId === undefined
      ? null
      : (receiveIdByItemId.get(firstVanillaId) ?? null);
    if (datasetReceiveId !== romChest.itemByte) {
      vanillaItemDiffs.push({
        checkId: check.id, name: check.name,
        romItemByte: romChest.itemByte, datasetReceiveId,
      });
    }
  }

  return { chestMismatches, vanillaItemDiffs };
};

export { censusFindings };
