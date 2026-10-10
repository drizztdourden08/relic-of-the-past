/* @layer test @kind test */
import { it, expect, afterEach } from 'vitest';
import { all, getCheck, getItem, getScreen, registerRecord, replaceRecord, unregisterRecord } from '@rotp/game-data';
import type { CheckRecord, ScreenId } from '@rotp/game-data';
import type { ChestObservation } from '@rotp/game-core';
import type { DetectionContext, ScreenObservations } from '@rotp/navigation';
import { detectorFromStrategy, checkStrategy } from '@rotp/navigation';
import { describeDataset } from '../../dataset-guard';
import { required } from '../../required';

const ROOM = 260;
const SCREEN: ScreenId = 'screen-204';
const CHECK_ID = 'check-026';

const ORIGINAL: CheckRecord = getCheck(CHECK_ID);

const CONTENTS = getItem(required(ORIGINAL.vanillaItemIds[0], 'the vanilla item')).gameId?.receiveItemId as number;

const roomChest = (overrides: Partial<ChestObservation> = {}): ChestObservation => ({
  chestIndex: 0,
  isBig: false,
  itemId: CONTENTS,
  isOpen: false,
  posKnown: true,
  col: 20,
  row: 28,
  ...overrides,
});

const observations = (overrides: Partial<ScreenObservations> = {}): ScreenObservations => ({
  match: null,
  liveGameId: { roomIndex: ROOM },
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

const contextFor = (o: Partial<ScreenObservations>, screenId: ScreenId | null = SCREEN): DetectionContext => {
  const match = screenId ? { screen: getScreen(screenId), method: 'exact' as const } : null;
  return { origin: 'live', screenId, observations: observations({ match, ...o }) };
};

const restore = (): void => {
  const original = { ...ORIGINAL };
  if (!replaceRecord('check', original)) registerRecord('check', original);
};

afterEach(restore);

const detector = detectorFromStrategy(checkStrategy);

describeDataset('check strategy on create', () => {
  it('proposes a check for a chest the room draws that no record covers', () => {
    unregisterRecord('check', CHECK_ID);

    const drafts = detector.detect(contextFor({ chests: [roomChest()] }));

    expect(drafts).toHaveLength(1);
    const draft = required(drafts[0], 'the one draft');
    expect(draft.kind).toBe('check');
    expect(draft.action).toBe('create');
    expect(draft.targetId).toBeNull();
    expect(draft.detector).toBe('strategy:check');
    expect(draft.confidence).toBe('certain');
    expect(draft.key).toBe(`chest:${ROOM}:0`);
    expect(draft.screenId).toBe(SCREEN);
    expect(draft.proposed).not.toHaveProperty('id');

    const proposed = draft.proposed as CheckRecord;
    expect(proposed.kind).toBe('chest');
    expect(proposed.gameId).toEqual({ roomId: ROOM, chestIndex: 0 });
    expect(proposed.screenId).toBe(SCREEN);
    expect(proposed.vanillaItemIds).toEqual(ORIGINAL.vanillaItemIds);
  });

  it('leaves vanillaItemIds empty instead of inventing one for an uncatalogued reward', () => {
    unregisterRecord('check', CHECK_ID);
    const unknown = Math.max(...all('item').map(i => i.gameId?.receiveItemId ?? 0)) + 5;

    const drafts = detector.detect(contextFor({ chests: [roomChest({ itemId: unknown })] }));

    expect((required(drafts[0], 'the first draft').proposed as CheckRecord).vanillaItemIds).toEqual([]);
  });

  it('mints one finding per chest slot when a room draws several unknown ones', () => {
    unregisterRecord('check', CHECK_ID);

    const drafts = detector.detect(contextFor({
      chests: [roomChest(), roomChest({ chestIndex: 1, isBig: true })],
    }));

    expect(drafts.map(d => d.key)).toEqual([`chest:${ROOM}:0`, `chest:${ROOM}:1`]);
  });
});

describeDataset('check strategy when already covered', () => {
  it('proposes nothing for a chest the dataset already catalogues', () => {
    expect(detector.detect(contextFor({ chests: [roomChest()] }))).toEqual([]);
  });

  it('proposes nothing when the pass resolved another screen record for the same room', () => {
    const variant = all('screen').find(s => s.gameId.roomIndex === ROOM && s.id !== SCREEN);
    if (!variant) throw new Error('dataset has no second screen record for this room');

    expect(detector.detect(contextFor({ chests: [roomChest()] }, variant.id))).toEqual([]);
  });
});

describeDataset('check strategy on update', () => {
  it('corrects a record catalogued as something other than a chest', () => {
    const asNpc: CheckRecord = { ...ORIGINAL, kind: 'npc' };
    replaceRecord('check', asNpc);

    const drafts = detector.detect(contextFor({ chests: [roomChest()] }));

    expect(drafts).toHaveLength(1);
    const draft = required(drafts[0], 'the one draft');
    expect(draft.action).toBe('update');
    expect(draft.targetId).toBe(CHECK_ID);
    expect(draft.confidence).toBe('certain');
    expect((draft.proposed as CheckRecord).kind).toBe('chest');
    expect((draft.current as CheckRecord).kind).toBe('npc');
  });

  it('corrects a record whose screen belongs to a different room', () => {
    const elsewhere = all('screen').find(s => s.gameId.roomIndex != null && s.gameId.roomIndex !== ROOM);
    if (!elsewhere) throw new Error('dataset has no screen for another room');
    const movedAway: CheckRecord = { ...ORIGINAL, screenId: elsewhere.id };
    replaceRecord('check', movedAway);

    const drafts = detector.detect(contextFor({ chests: [roomChest()] }));

    expect(drafts).toHaveLength(1);
    expect((required(drafts[0], 'the one draft').proposed as CheckRecord).screenId).toBe(SCREEN);
  });
});

describeDataset('check strategy and what it refuses to read', () => {
  it('stays silent when the chest table was never read', () => {
    expect(detector.detect(contextFor({}))).toEqual([]);
  });

  it('stays silent outdoors, where there is no chest table at all', () => {
    unregisterRecord('check', CHECK_ID);
    expect(detector.detect(contextFor({ chests: [roomChest()], isIndoors: false }))).toEqual([]);
  });

  it('stays silent when the room resolved to no screen', () => {
    unregisterRecord('check', CHECK_ID);
    expect(detector.detect(contextFor({ chests: [roomChest()] }, null))).toEqual([]);
  });
});
