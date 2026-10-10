/* @layer test @kind test */
import { it, expect } from 'vitest';
import { all, getItem, getItemByGameId } from '@rotp/game-data';
import type { ItemId, ItemRecord } from '@rotp/game-data';
import { registerDetector, runDetection, detectorFromStrategy, itemStrategy } from '@rotp/navigation';
import type { ChestObservation } from '@rotp/game-core';
import type { DetectionContext, ScreenObservations } from '@rotp/navigation';
import { describeDataset } from '../../dataset-guard';
import { required } from '../../required';

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

const aliasedItem = (): ItemRecord => {
  const item = all('item').find(i => i.aliasOf && i.gameId?.receiveItemId != null);
  if (!item) throw new Error('dataset has no aliasOf item with a receiveItemId');
  return item;
};

registerDetector(detectorFromStrategy(itemStrategy));

const detect = (context: DetectionContext) => runDetection('item', context).drafts;
const creates = (context: DetectionContext) => detect(context).filter(d => d.action === 'create');
const updates = (context: DetectionContext) => detect(context).filter(d => d.action === 'update');

describeDataset('item strategy on create', () => {
  it('proposes a new ItemRecord for a granted native id no record covers', () => {
    const unknown = Math.max(...all('item').map(i => i.gameId?.receiveItemId ?? 0)) + 5;
    expect(getItemByGameId({ receiveItemId: unknown })).toBeUndefined();

    const drafts = creates(contextFor({
      grantedItems: [{ itemId: unknown, receiveCount: 3, ownedItemIds: [], fromInventoryDelta: false }],
    }));

    expect(drafts).toHaveLength(1);
    const draft = required(drafts[0], 'the one draft');
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
    expect(required(drafts[0], 'the one draft').confidence).toBe('likely');
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

describeDataset('item strategy on chest contents', () => {
  it('proposes a record for a chest holding an id no ItemRecord covers, without it being opened', () => {
    const unknown = uncatalogued();
    const drafts = creates(contextFor({ chests: [roomChest(unknown)] }));

    expect(drafts).toHaveLength(1);
    const draft = required(drafts[0], 'the one draft');
    expect(draft.confidence).toBe('certain');
    expect(required(draft.evidence[0], 'the first evidence').source).toBe('native:room-chests');
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
    const draft = required(drafts[0], 'the one draft');
    expect(draft.confidence).toBe('certain');
    expect(required(draft.evidence[0], 'the first evidence').source).toBe('native:room-chests');
  });

  it('stays silent when neither the chest table nor the receive table was read', () => {
    expect(creates(contextFor({}))).toEqual([]);
  });
});

describeDataset('item strategy on an alias mismatch', () => {
  it('flags a record whose aliasOf rule the observed grant contradicts', () => {
    const item = aliasedItem();
    const primary = item.gameId?.receiveItemId as number;
    const alias = getItem(item.aliasOf as ItemId);

    const drafts = updates(contextFor({
      grantedItems: [{ itemId: primary, receiveCount: 1, ownedItemIds: [item.id], fromInventoryDelta: false }],
    })).filter(d => d.targetId === item.id);

    expect(drafts).toHaveLength(1);
    const draft = required(drafts[0], 'the one draft');
    expect(draft.targetId).toBe(item.id);
    expect(draft.detector).toBe('strategy:item');
    expect(draft.confidence).toBe('certain');
    expect((draft.proposed as ItemRecord).aliasOf).toBeUndefined();
    expect(draft.reason).toContain(alias.name);
  });

  it('grades an alias mismatch sourced from a tracker delta only likely', () => {
    const item = aliasedItem();
    const primary = item.gameId?.receiveItemId as number;
    const drafts = updates(contextFor({
      grantedItems: [{ itemId: primary, receiveCount: 1, ownedItemIds: [item.id], fromInventoryDelta: true }],
    })).filter(d => d.targetId === item.id);
    expect(drafts).toHaveLength(1);
    expect(required(drafts[0], 'the one draft').confidence).toBe('likely');
  });

  it('proposes nothing when the item was not yet owned, because no swap was expected', () => {
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
