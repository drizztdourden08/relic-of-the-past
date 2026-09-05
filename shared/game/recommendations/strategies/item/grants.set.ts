/* @layer shared-game @kind data */
/**
 * A native item id no `ItemRecord.gameId.receiveItemId` covers, from the
 * three places the game says so. Each gets its OWN `SetProbe` instead of one
 * probe folding all three together, because `SetProbe.confidence`/`.source`
 * are fixed per probe, not per live item, and these three differ
 * in both: the room's own chest table needs nothing to have happened
 * (`certain`, `native:room-chests`), a direct native receive-count tally is
 * likewise enumerable (`certain`, `native:receive-count`), but a grant sourced
 * from watching the tracker's inventory change only proves an item appeared,
 * never that the native table backs it (`likely`, `tracker:inventory-delta`).
 * Folding them into one probe would force every finding it produces to share
 * one confidence and one evidence source, silently overstating the weaker two.
 *
 * All three share `item-lookup.ts`'s join (same key space, same placeholder),
 * so a `create` proposed by any of them is identical in shape. Only the
 * evidence differs. Registered in this file's priority order (chest, then
 * native receive, then tracker delta) in `item.strategy.ts`'s `sets` array:
 * when more than one fires for the SAME id in one pass, `runDetection`'s own
 * id-based dedup (`registry.ts`) keeps whichever draft was produced FIRST,
 * so the enumerable source wins a tie against a grant, and a native tally
 * wins a tie against a delta. That reproduces `item-grants.ts`'s own priority
 * ("Chests first, so the enumerable source wins a tie against a grant")
 * without a custom dedup map of this strategy's own.
 *
 * `removable: false` on every one: none of these tables ever prove an
 * EXISTING `ItemRecord` wrong to exist, only that a new one is missing.
 */
import { unread } from '../../compare/probe-helpers';
import type { Probe, SetProbe } from '../../compare/probe.types';
import type { ScreenObservations } from '../../detection-types';
import {
  datasetKey, liveKey, readDataset, toProposed,
} from './item-lookup';

const CHEST_ITEM_PROBE: SetProbe<'item', number> = {
  id: 'item-chest-contents',
  noun: 'item',
  readLive: (observations: ScreenObservations): Probe<readonly number[]> => {
    const { chests } = observations;
    if (!chests) return unread();
    return { known: true, value: chests.map(chest => chest.itemId) };
  },
  readDataset,
  liveKey,
  datasetKey,
  toProposed,
  removable: false,
  source: 'native:room-chests',
  confidence: 'certain',
};

const RECEIVE_ITEM_PROBE: SetProbe<'item', number> = {
  id: 'item-receive-count',
  noun: 'item',
  readLive: (observations: ScreenObservations): Probe<readonly number[]> => {
    const { grantedItems } = observations;
    if (!grantedItems) return unread();
    return { known: true, value: grantedItems.filter(g => !g.fromInventoryDelta).map(g => g.itemId) };
  },
  readDataset,
  liveKey,
  datasetKey,
  toProposed,
  removable: false,
  source: 'native:receive-count',
  confidence: 'certain',
};

const DELTA_ITEM_PROBE: SetProbe<'item', number> = {
  id: 'item-inventory-delta',
  noun: 'item',
  readLive: (observations: ScreenObservations): Probe<readonly number[]> => {
    const { grantedItems } = observations;
    if (!grantedItems) return unread();
    return { known: true, value: grantedItems.filter(g => g.fromInventoryDelta).map(g => g.itemId) };
  },
  readDataset,
  liveKey,
  datasetKey,
  toProposed,
  removable: false,
  source: 'tracker:inventory-delta',
  confidence: 'likely',
};

export { CHEST_ITEM_PROBE, DELTA_ITEM_PROBE, RECEIVE_ITEM_PROBE };
