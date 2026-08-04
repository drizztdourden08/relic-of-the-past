/* @layer shared-game @kind logic */
/**
 * Shared join/placeholder helpers for `grants.set.ts`'s three uncatalogued-id
 * probes — every one of them keys the same way (the raw native id, in the
 * same space `ItemGameId.receiveItemId` occupies) and proposes the same
 * neutral placeholder record when it fires.
 */
import { find } from '../../../data';
import type { ItemRecord } from '../../../data';

const hex = (n: number): string => `0x${n.toString(16).toUpperCase()}`;

/**
 * The neutral placeholders a `create` proposes: `category`/`randomizerName`
 * have no native answer (unlike a screen's authoring gaps, `ItemRecord`
 * requires both), so this proposes the dataset's own neutral defaults rather
 * than guessing a real one. `origin: 'vanilla'` IS provable: anything that
 * reached this join (a chest's static contents, or the native receive path)
 * is a real in-game item by definition.
 */
const placeholderFor = (itemId: number): Omit<ItemRecord, 'id'> => ({
  origin: 'vanilla',
  category: 'junk',
  randomizerName: `Unnamed item ${hex(itemId)}`,
  gameId: { receiveItemId: itemId },
});

const readDataset = (): readonly ItemRecord[] => find('item', item => item.gameId?.receiveItemId != null);

const liveKey = (itemId: number): string => String(itemId);

const datasetKey = (record: ItemRecord): string => String(record.gameId?.receiveItemId);

const toProposed = (itemId: number): Omit<ItemRecord, 'id'> => placeholderFor(itemId);

export {
  datasetKey, hex, liveKey, placeholderFor, readDataset, toProposed,
};
