/* @layer shared-game @kind logic */
import { find } from '../../../data';
import type { ItemRecord } from '../../../data';
import { unread } from '../../compare/probe-reading';
import type { Probe, SetProbe } from '../../compare/probe.type';
import type { ScreenObservations } from '../../detection-types';
import type { Confidence } from '../../types';
import { hexLabel } from '../hex-label';

const readDataset = (): readonly ItemRecord[] => find('item', item => item.gameId?.receiveItemId != null);

const liveKey = (itemId: number): string => String(itemId);

const datasetKey = (record: ItemRecord): string => String(record.gameId?.receiveItemId);

const toProposed = (itemId: number): Omit<ItemRecord, 'id'> => ({
  origin: 'vanilla',
  category: 'junk',
  name: `Unnamed item ${hexLabel(itemId)}`,
  gameId: { receiveItemId: itemId },
});

const grantProbe = (
  id: string,
  source: string,
  confidence: Confidence,
  readLive: (observations: ScreenObservations) => Probe<readonly number[]>,
): SetProbe<'item', number> => ({
  id,
  noun: 'item',
  readLive,
  readDataset,
  liveKey,
  datasetKey,
  toProposed,
  removable: false,
  source,
  confidence,
});

const chestItemProbe = grantProbe('item-chest-contents', 'native:room-chests', 'certain', (observations) => {
  const { chests } = observations;
  if (!chests) return unread();
  return { known: true, value: chests.map(chest => chest.itemId) };
});

const receiveItemProbe = grantProbe('item-receive-count', 'native:receive-count', 'certain', (observations) => {
  const { grantedItems } = observations;
  if (!grantedItems) return unread();
  return { known: true, value: grantedItems.filter(g => !g.fromInventoryDelta).map(g => g.itemId) };
});

const deltaItemProbe = grantProbe('item-inventory-delta', 'tracker:inventory-delta', 'likely', (observations) => {
  const { grantedItems } = observations;
  if (!grantedItems) return unread();
  return { known: true, value: grantedItems.filter(g => g.fromInventoryDelta).map(g => g.itemId) };
});

const grantProbes: readonly SetProbe<'item', number>[] = [chestItemProbe, receiveItemProbe, deltaItemProbe];

export { grantProbes };
