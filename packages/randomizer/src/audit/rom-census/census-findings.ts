/* @layer shared-game @kind logic */
import type { CheckRecord, ItemRecord } from '@rotp/game-data';
import type {
  CensusFindings, ChestInspection, ChestMismatch, RomCensus, RomChest, VanillaItemDiff,
} from './rom-census.type';

const inspectChest = (check: CheckRecord, census: RomCensus): ChestInspection => {
  const { roomId, chestIndex } = check.gameId;

  if (roomId === undefined || chestIndex === undefined) {
    return {
      mismatch: {
        checkId: check.id, name: check.name,
        roomId: roomId ?? null, chestIndex: chestIndex ?? null,
        reason: 'missing roomId/chestIndex in gameId',
      },
    };
  }

  const chest = census.chestsByRoom.get(roomId)?.find((c) => c.chestIndex === chestIndex);
  if (!chest) {
    return {
      mismatch: {
        checkId: check.id, name: check.name, roomId, chestIndex,
        reason: 'no chest at (roomId, chestIndex) in the native table',
      },
    };
  }
  return { chest };
};

const vanillaDiffOf = (
  check: CheckRecord,
  romChest: RomChest,
  receiveIdByItemId: ReadonlyMap<string, number | null>,
): VanillaItemDiff | null => {
  const firstVanillaId = check.vanillaItemIds[0];
  const datasetReceiveId = firstVanillaId === undefined
    ? null
    : (receiveIdByItemId.get(firstVanillaId) ?? null);
  if (datasetReceiveId === romChest.itemByte) return null;
  return { checkId: check.id, name: check.name, romItemByte: romChest.itemByte, datasetReceiveId };
};

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
    const inspected = inspectChest(check, census);
    if ('mismatch' in inspected) {
      chestMismatches.push(inspected.mismatch);
      continue;
    }
    const diff = vanillaDiffOf(check, inspected.chest, receiveIdByItemId);
    if (diff !== null) vanillaItemDiffs.push(diff);
  }

  return { chestMismatches, vanillaItemDiffs };
};

export { censusFindings };
