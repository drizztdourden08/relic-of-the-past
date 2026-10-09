/* @layer shared-game @kind logic */
import type { ItemRecord } from '@rotp/game-data';
import type { VanillaResolution } from './comparator.type';

const resolveVanillaReceiveId = (
  vanillaItemIds: readonly string[],
  itemById: ReadonlyMap<string, ItemRecord>,
): VanillaResolution => {
  const firstId = vanillaItemIds[0];
  if (firstId === undefined) return { itemId: null, receiveItemId: null };
  const item = itemById.get(firstId);
  if (item === undefined) return { itemId: firstId, receiveItemId: null };
  const direct = item.gameId?.receiveItemId;
  if (direct !== undefined) return { itemId: firstId, receiveItemId: direct };
  const alias = item.aliasOf === undefined ? undefined : itemById.get(item.aliasOf);
  return { itemId: firstId, receiveItemId: alias?.gameId?.receiveItemId ?? null };
};

export { resolveVanillaReceiveId };
