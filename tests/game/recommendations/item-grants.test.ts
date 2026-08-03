/* @layer test @kind test */
/**
 * The item-grants detector: a granted native item id with no ItemRecord, or an
 * existing record whose aliasOf duplicate-swap rule the observed grant
 * contradicts.
 */
import { describe, it, expect } from 'vitest';
import { all, getItem, getItemByGameId } from '@shared/game/data';
import type { ItemId, ItemRecord } from '@shared/game/data';
import type { ChestObservation, DetectionContext, ScreenObservations } from '@shared/game/recommendations';
import { itemGrantsDetector } from '@shared/game/recommendations/detectors/item-grants';

const observations = (overrides: Partial<ScreenObservations> = {}): ScreenObservations => ({
  match: null,
  liveGameId: null,
  isIndoors: true,
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

describe('item-grants detector — create', () => {
  it('proposes a new ItemRecord for a granted native id no record covers', () => {
    const uncatalogued = Math.max(...all('item').map(i => i.gameId?.receiveItemId ?? 0)) + 5;
    expect(getItemByGameId({ receiveItemId: uncatalogued })).toBeUndefined();

    const drafts = itemGrantsDetector.detect(contextFor({
      grantedItems: [{ itemId: uncatalogued, receiveCount: 3, ownedItemIds: [], fromInventoryDelta: false }],
    }));

    expect(drafts).toHaveLength(1);
    const [draft] = drafts;
    expect(draft.action).toBe('create');
    expect(draft.targetId).toBeNull();
    expect(draft.confidence).toBe('certain');
    expect(draft.key).toBe(`receiveItemId:${uncatalogued}`);
    expect(draft.proposed).not.toHaveProperty('id');
    const proposed = draft.proposed as ItemRecord;
    expect(proposed.origin).toBe('vanilla');
    expect(proposed.gameId?.receiveItemId).toBe(uncatalogued);
  });

  it('grades a tracker-inventory-delta grant only likely', () => {
    const uncatalogued = Math.max(...all('item').map(i => i.gameId?.receiveItemId ?? 0)) + 5;
    const drafts = itemGrantsDetector.detect(contextFor({
      grantedItems: [{ itemId: uncatalogued, receiveCount: 0, ownedItemIds: [], fromInventoryDelta: true }],
    }));
    expect(drafts).toHaveLength(1);
    expect(drafts[0].confidence).toBe('likely');
  });

  it('proposes nothing for a granted id that already has a record', () => {
    const item = all('item').find(i => i.gameId?.receiveItemId != null);
    if (!item) throw new Error('dataset has no item with a receiveItemId');
    const drafts = itemGrantsDetector.detect(contextFor({
      grantedItems: [{ itemId: item.gameId?.receiveItemId as number, receiveCount: 1, ownedItemIds: [], fromInventoryDelta: false }],
    }));
    expect(drafts).toEqual([]);
  });

  it('stays silent when nothing was granted', () => {
    expect(itemGrantsDetector.detect(contextFor({}))).toEqual([]);
  });
});

describe('item-grants detector — chest contents', () => {
  it('proposes a record for a chest holding an id no ItemRecord covers, without it being opened', () => {
    const unknown = uncatalogued();
    const drafts = itemGrantsDetector.detect(contextFor({ chests: [roomChest(unknown)] }));

    expect(drafts).toHaveLength(1);
    const [draft] = drafts;
    expect(draft.action).toBe('create');
    // Enumerable native table, so this outranks a single observed grant.
    expect(draft.confidence).toBe('certain');
    expect(draft.evidence[0].source).toBe('native:room-chests');
    expect(draft.key).toBe(`receiveItemId:${unknown}`);
    expect((draft.proposed as ItemRecord).gameId?.receiveItemId).toBe(unknown);
  });

  it('proposes nothing for a chest whose contents the catalogue already covers', () => {
    const item = all('item').find(i => i.gameId?.receiveItemId != null);
    if (!item) throw new Error('dataset has no item with a receiveItemId');
    const drafts = itemGrantsDetector.detect(contextFor({
      chests: [roomChest(item.gameId?.receiveItemId as number)],
    }));
    expect(drafts).toEqual([]);
  });

  it('collapses a chest signal and a grant for the same id into the certain finding', () => {
    const unknown = uncatalogued();
    const drafts = itemGrantsDetector.detect(contextFor({
      chests: [roomChest(unknown)],
      grantedItems: [{ itemId: unknown, receiveCount: 0, ownedItemIds: [], fromInventoryDelta: true }],
    }));

    expect(drafts).toHaveLength(1);
    expect(drafts[0].confidence).toBe('certain');
    expect(drafts[0].evidence[0].source).toBe('native:room-chests');
  });

  it('stays silent when neither the chest table nor the receive table was read', () => {
    expect(itemGrantsDetector.detect(contextFor({}))).toEqual([]);
  });
});

describe('item-grants detector — alias mismatch', () => {
  it('flags a record whose aliasOf rule the observed grant contradicts', () => {
    const item = aliasedItem();
    const primary = item.gameId?.receiveItemId as number;
    const alias = getItem(item.aliasOf as ItemId);

    const drafts = itemGrantsDetector.detect(contextFor({
      grantedItems: [{ itemId: primary, receiveCount: 1, ownedItemIds: [item.id], fromInventoryDelta: false }],
    }));

    expect(drafts).toHaveLength(1);
    const [draft] = drafts;
    expect(draft.action).toBe('update');
    expect(draft.targetId).toBe(item.id);
    expect(draft.confidence).toBe('certain');
    expect((draft.proposed as ItemRecord).aliasOf).toBeUndefined();
    expect(draft.reason).toContain(alias.randomizerName);
  });

  it('grades an alias mismatch sourced from a tracker delta only likely', () => {
    const item = aliasedItem();
    const primary = item.gameId?.receiveItemId as number;
    const drafts = itemGrantsDetector.detect(contextFor({
      grantedItems: [{ itemId: primary, receiveCount: 1, ownedItemIds: [item.id], fromInventoryDelta: true }],
    }));
    expect(drafts).toHaveLength(1);
    expect(drafts[0].confidence).toBe('likely');
  });

  it('proposes nothing when the item was not yet owned — no swap was expected', () => {
    const item = aliasedItem();
    const primary = item.gameId?.receiveItemId as number;
    const drafts = itemGrantsDetector.detect(contextFor({
      grantedItems: [{ itemId: primary, receiveCount: 1, ownedItemIds: [], fromInventoryDelta: false }],
    }));
    expect(drafts).toEqual([]);
  });

  it('proposes nothing for a plain record with no aliasOf at all', () => {
    const item = all('item').find(i => !i.aliasOf && i.gameId?.receiveItemId != null);
    if (!item) throw new Error('dataset has no plain item with a receiveItemId');
    const drafts = itemGrantsDetector.detect(contextFor({
      grantedItems: [{
        itemId: item.gameId?.receiveItemId as number, receiveCount: 1,
        ownedItemIds: [item.id] as ItemId[], fromInventoryDelta: false,
      }],
    }));
    expect(drafts).toEqual([]);
  });
});
