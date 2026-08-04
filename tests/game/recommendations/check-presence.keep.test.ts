/* @layer test @kind test */
/**
 * The `check` strategy, driven by the room-addressable chest table.
 *
 * Ported from the hand-written `check-presence` detector (deleted) onto the
 * declarative comparison engine — `strategy:check` is the detector id now.
 * The screen-correction probe's live value is "the screen we are currently
 * on", which a `FieldProbe` can only read off `observations.match?.screen.id`
 * (see `corrections.probes.ts`'s own header for why), so unlike the original
 * detector's bare `screenId` context argument, `contextFor` here also builds
 * a matching `ScreenMatchResult` — exactly what production always carries in
 * lockstep with `context.screenId` (`use-screen-observations.ts`).
 *
 * The fixture is the real starting interior — the screen a fresh save opens on,
 * whose single chest is the earliest check in the game — rather than a
 * hand-built room, so what the strategy is asked about is a shape the dataset
 * actually holds. The dataset is put back the way it was after each case.
 */
import { describe, it, expect, afterEach } from 'vitest';
import {
  all, getCheck, getItem, getScreen, registerRecord, replaceRecord, unregisterRecord,
} from '@shared/game/data';
import type { CheckRecord, ScreenId } from '@shared/game/data';
import type { ChestObservation, DetectionContext, ScreenObservations } from '@shared/game/recommendations';
import { detectorFromStrategy } from '@shared/game/recommendations/compare';
import { checkStrategy } from '@shared/game/recommendations/strategies/check';

/** The interior a fresh save opens in, and the check catalogued for its chest. */
const ROOM = 260;
const SCREEN: ScreenId = 'screen-204';
const CHECK_ID = 'check-026';

const ORIGINAL: CheckRecord = getCheck(CHECK_ID);

/** The raw contents byte the chest table reports — the catalogued reward's own receive id. */
const CONTENTS = getItem(ORIGINAL.vanillaItemIds[0]).gameId?.receiveItemId as number;

/** What `wasmGetRoomChests(260)` reports: one small chest in draw slot 0. */
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

/** Mirrors `use-screen-observations.ts`: `context.screenId` and
 *  `observations.match?.screen.id` always agree in production. */
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

describe('check strategy — create', () => {
  it('proposes a check for a chest the room draws that no record covers', () => {
    unregisterRecord('check', CHECK_ID);

    const drafts = detector.detect(contextFor({ chests: [roomChest()] }));

    expect(drafts).toHaveLength(1);
    const [draft] = drafts;
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
    // The contents byte is a raw receive id, so it resolves to the real reward.
    expect(proposed.vanillaItemIds).toEqual(ORIGINAL.vanillaItemIds);
  });

  it('leaves vanillaItemIds empty rather than inventing one for an uncatalogued reward', () => {
    unregisterRecord('check', CHECK_ID);
    const unknown = Math.max(...all('item').map(i => i.gameId?.receiveItemId ?? 0)) + 5;

    const drafts = detector.detect(contextFor({ chests: [roomChest({ itemId: unknown })] }));

    expect((drafts[0].proposed as CheckRecord).vanillaItemIds).toEqual([]);
  });

  it('mints one finding per chest slot when a room draws several unknown ones', () => {
    unregisterRecord('check', CHECK_ID);

    const drafts = detector.detect(contextFor({
      chests: [roomChest(), roomChest({ chestIndex: 1, isBig: true })],
    }));

    expect(drafts.map(d => d.key)).toEqual([`chest:${ROOM}:0`, `chest:${ROOM}:1`]);
  });
});

describe('check strategy — already covered', () => {
  it('proposes nothing for a chest the dataset already catalogues', () => {
    expect(detector.detect(contextFor({ chests: [roomChest()] }))).toEqual([]);
  });

  it('proposes nothing when the pass resolved another screen record for the same room', () => {
    const variant = all('screen').find(s => s.gameId.roomIndex === ROOM && s.id !== SCREEN);
    if (!variant) throw new Error('dataset has no second screen record for this room');

    expect(detector.detect(contextFor({ chests: [roomChest()] }, variant.id))).toEqual([]);
  });
});

describe('check strategy — update', () => {
  it('corrects a record catalogued as something other than a chest', () => {
    replaceRecord('check', { ...ORIGINAL, kind: 'npc' });

    const drafts = detector.detect(contextFor({ chests: [roomChest()] }));

    expect(drafts).toHaveLength(1);
    const [draft] = drafts;
    expect(draft.action).toBe('update');
    expect(draft.targetId).toBe(CHECK_ID);
    expect(draft.confidence).toBe('certain');
    expect((draft.proposed as CheckRecord).kind).toBe('chest');
    expect((draft.current as CheckRecord).kind).toBe('npc');
  });

  it('corrects a record whose screen belongs to a different room', () => {
    const elsewhere = all('screen').find(s => s.gameId.roomIndex != null && s.gameId.roomIndex !== ROOM);
    if (!elsewhere) throw new Error('dataset has no screen for another room');
    replaceRecord('check', { ...ORIGINAL, screenId: elsewhere.id });

    const drafts = detector.detect(contextFor({ chests: [roomChest()] }));

    expect(drafts).toHaveLength(1);
    expect((drafts[0].proposed as CheckRecord).screenId).toBe(SCREEN);
  });
});

describe('check strategy — what it refuses to read', () => {
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
