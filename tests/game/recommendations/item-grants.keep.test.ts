/* @layer test @kind test */
/**
 * The `item` strategy: a granted native item id with no ItemRecord, or an
 * existing record whose aliasOf duplicate-swap rule the observed grant
 * contradicts.
 *
 * Ported from the hand-written `item-grants` detector (deleted) onto the
 * declarative comparison engine — `strategy:item` is the detector id now.
 * The create side is three `SetProbe`s (`grants.set.ts`: chest contents,
 * native receive count, tracker inventory delta) rather than one, because a
 * `SetProbe`'s confidence and evidence source are fixed per probe, not per
 * live item, and this finding genuinely varies both by source — see that
 * file's own header. The alias-mismatch side is likewise split into two
 * `FieldProbe`s (`alias.probes.ts`) for the same reason. All five probes
 * share one detector id (`strategy:item`), so the original's own tie-break
 * (a chest signal beats a grant signal for the same id) now falls out of
 * `runDetection`'s id-based dedup — see `grants.set.ts` for why the
 * registration order in `item.strategy.ts` reproduces it. That dedup lives in
 * `runDetection`, not in a bare `detector.detect()` call (the original
 * hand-written detector did its own internal dedup instead), so this file
 * drives the strategy through `registerDetector`+`runDetection` — exactly
 * how `runPass` (`use-detection-pass.ts`) actually consumes it in
 * production — rather than calling `.detect()` directly the way the
 * screen/connection parity tests do, since none of THEIR probes can ever
 * produce two different-confidence drafts for the same key.
 */
import { describe, it, expect } from 'vitest';
import { all, getItem, getItemByGameId } from '@shared/game/data';
import type { ItemId, ItemRecord } from '@shared/game/data';
import {
  registerDetector, runDetection,
} from '@shared/game/recommendations';
import type { ChestObservation, DetectionContext, ScreenObservations } from '@shared/game/recommendations';
import { detectorFromStrategy } from '@shared/game/recommendations/compare';
import { itemStrategy } from '@shared/game/recommendations/strategies/item';
import { describeDataset } from '../../dataset-guard';

const observations = (overrides: Partial<ScreenObservations> = {}): ScreenObservations => ({
  match: null,
  liveGameId: null,
  isIndoors: true,
  isDarkWorld: false,
  realTransitions: [],
  realAvailable: true,
  unmatchedCrossings: [],
  floodConnections: [],
  existingConnections: [],
  palaceMismatches: [],
  ...overrides,
});

const contextFor = (o: Partial<ScreenObservations>): DetectionContext =>
  ({ origin: 'live', screenId: 'screen-001', observations: observations(o) });

const roomChest = (itemId: number, overrides: Partial<ChestObservation> = {}): ChestObservation =>
  ({ chestIndex: 0, isBig: false, itemId, isOpen: false, posKnown: true, col: 20, row: 28, ...overrides });

const uncatalogued = (): number => Math.max(...all('item').map(i => i.gameId?.receiveItemId ?? 0)) + 5;

/** An item whose chest swaps to an alternate once its own item is already owned. */
const aliasedItem = (): ItemRecord => {
  const item = all('item').find(i => i.aliasOf && i.gameId?.receiveItemId != null);
  if (!item) throw new Error('dataset has no aliasOf item with a receiveItemId');
  return item;
};

registerDetector(detectorFromStrategy(itemStrategy));

const detect = (context: DetectionContext) => runDetection('item', context).drafts;
const creates = (context: DetectionContext) => detect(context).filter(d => d.action === 'create');
const updates = (context: DetectionContext) => detect(context).filter(d => d.action === 'update');

describeDataset('item strategy — create', () => {
  it('proposes a new ItemRecord for a granted native id no record covers', () => {
    const unknown = Math.max(...all('item').map(i => i.gameId?.receiveItemId ?? 0)) + 5;
    expect(getItemByGameId({ receiveItemId: unknown })).toBeUndefined();

    const drafts = creates(contextFor({
      grantedItems: [{ itemId: unknown, receiveCount: 3, ownedItemIds: [], fromInventoryDelta: false }],
    }));

    expect(drafts).toHaveLength(1);
    const [draft] = drafts;
    expect(draft.targetId).toBeNull();
    expect(draft.detector).toBe('strategy:item');
    expect(draft.confidence).toBe('certain');
    expect(draft.key).toBe(`item:${unknown}`);
    expect(draft.proposed).not.toHaveProperty('id');
    const proposed = draft.proposed as ItemRecord;
    expect(proposed.origin).toBe('vanilla');
    expect(proposed.gameId?.receiveItemId).toBe(unknown);
  });

  it('grades a tracker-inventory-delta grant only likely', () => {
    const unknown = Math.max(...all('item').map(i => i.gameId?.receiveItemId ?? 0)) + 5;
    const drafts = creates(contextFor({
      grantedItems: [{ itemId: unknown, receiveCount: 0, ownedItemIds: [], fromInventoryDelta: true }],
    }));
    expect(drafts).toHaveLength(1);
    expect(drafts[0].confidence).toBe('likely');
  });

  it('proposes nothing for a granted id that already has a record', () => {
    const item = all('item').find(i => i.gameId?.receiveItemId != null);
    if (!item) throw new Error('dataset has no item with a receiveItemId');
    const drafts = creates(contextFor({
      grantedItems: [{ itemId: item.gameId?.receiveItemId as number, receiveCount: 1, ownedItemIds: [], fromInventoryDelta: false }],
    }));
    expect(drafts).toEqual([]);
  });

  it('stays silent when nothing was granted', () => {
    expect(creates(contextFor({}))).toEqual([]);
  });
});

describeDataset('item strategy — chest contents', () => {
  it('proposes a record for a chest holding an id no ItemRecord covers, without it being opened', () => {
    const unknown = uncatalogued();
    const drafts = creates(contextFor({ chests: [roomChest(unknown)] }));

    expect(drafts).toHaveLength(1);
    const [draft] = drafts;
    // Enumerable native table, so this outranks a single observed grant.
    expect(draft.confidence).toBe('certain');
    expect(draft.evidence[0].source).toBe('native:room-chests');
    expect(draft.key).toBe(`item:${unknown}`);
    expect((draft.proposed as ItemRecord).gameId?.receiveItemId).toBe(unknown);
  });

  it('proposes nothing for a chest whose contents the catalogue already covers', () => {
    const item = all('item').find(i => i.gameId?.receiveItemId != null);
    if (!item) throw new Error('dataset has no item with a receiveItemId');
    const drafts = creates(contextFor({
      chests: [roomChest(item.gameId?.receiveItemId as number)],
    }));
    expect(drafts).toEqual([]);
  });

  it('collapses a chest signal and a grant for the same id into the certain finding', () => {
    const unknown = uncatalogued();
    const drafts = creates(contextFor({
      chests: [roomChest(unknown)],
      grantedItems: [{ itemId: unknown, receiveCount: 0, ownedItemIds: [], fromInventoryDelta: true }],
    }));

    expect(drafts).toHaveLength(1);
    expect(drafts[0].confidence).toBe('certain');
    expect(drafts[0].evidence[0].source).toBe('native:room-chests');
  });

  it('stays silent when neither the chest table nor the receive table was read', () => {
    expect(creates(contextFor({}))).toEqual([]);
  });
});

describeDataset('item strategy — alias mismatch', () => {
  it('flags a record whose aliasOf rule the observed grant contradicts', () => {
    const item = aliasedItem();
    const primary = item.gameId?.receiveItemId as number;
    const alias = getItem(item.aliasOf as ItemId);

    const drafts = updates(contextFor({
      grantedItems: [{ itemId: primary, receiveCount: 1, ownedItemIds: [item.id], fromInventoryDelta: false }],
    })).filter(d => d.targetId === item.id);

    expect(drafts).toHaveLength(1);
    const [draft] = drafts;
    expect(draft.targetId).toBe(item.id);
    expect(draft.detector).toBe('strategy:item');
    expect(draft.confidence).toBe('certain');
    expect((draft.proposed as ItemRecord).aliasOf).toBeUndefined();
    expect(draft.reason).toContain(alias.randomizerName);
  });

  it('grades an alias mismatch sourced from a tracker delta only likely', () => {
    const item = aliasedItem();
    const primary = item.gameId?.receiveItemId as number;
    const drafts = updates(contextFor({
      grantedItems: [{ itemId: primary, receiveCount: 1, ownedItemIds: [item.id], fromInventoryDelta: true }],
    })).filter(d => d.targetId === item.id);
    expect(drafts).toHaveLength(1);
    expect(drafts[0].confidence).toBe('likely');
  });

  it('proposes nothing when the item was not yet owned — no swap was expected', () => {
    const item = aliasedItem();
    const primary = item.gameId?.receiveItemId as number;
    const drafts = updates(contextFor({
      grantedItems: [{ itemId: primary, receiveCount: 1, ownedItemIds: [], fromInventoryDelta: false }],
    })).filter(d => d.targetId === item.id);
    expect(drafts).toEqual([]);
  });

  it('proposes nothing for a plain record with no aliasOf at all', () => {
    const item = all('item').find(i => !i.aliasOf && i.gameId?.receiveItemId != null);
    if (!item) throw new Error('dataset has no plain item with a receiveItemId');
    const drafts = updates(contextFor({
      grantedItems: [{
        itemId: item.gameId?.receiveItemId as number, receiveCount: 1,
        ownedItemIds: [item.id] as ItemId[], fromInventoryDelta: false,
      }],
    })).filter(d => d.targetId === item.id);
    expect(drafts).toEqual([]);
  });
});
