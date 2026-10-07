/* @layer test @kind test */
/**
 * The `screen` strategy against what the deleted `screen-identity.ts` detector
 * did (a `screenDataStatus` correction, the palace-mismatch map), PLUS what it
 * missed: a WRONG roomIndex/overworldIndex/entranceId, and a palace mismatch
 * on a screen that is not the one loaded.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { all, findOne } from '@shared/game/data';
import type { ScreenRecord } from '@shared/game/data';
import type { ScreenMatchResult } from '@shared/game/logic/queries/detection';
import { getScreenLookup } from '@shared/game/logic/queries/detection';
import { clearPalaceMismatches, getPalaceMismatches, scanForRoom } from '@shared/game/logic/queries/palace-fallback';
import type { DetectionContext, ScreenObservations } from '@shared/game/recommendations';
import { detectorFromStrategy } from '@shared/game/recommendations/compare';
import { screenStrategy } from '@shared/game/recommendations/strategies/screen';
import { describeDataset } from '../../dataset-guard';

/** A palace index no record uses, so the disagreement is real for every screen. */
const WRONG_PALACE = Math.max(...all('screen').map(s => s.gameId.palaceIndex ?? 0)) + 2;

const dungeonScreen = (exclude?: string): ScreenRecord => {
  const screen = all('screen').find(s =>
    s.kind === 'dungeon' && s.gameId.roomIndex != null && s.gameId.palaceIndex != null && s.id !== exclude);
  if (!screen) throw new Error('dataset has no dungeon screen with both native values');
  return screen;
};

const overworldScreen = (): ScreenRecord => {
  const screen = all('screen').find(s => s.kind === 'overworld' && s.gameId.overworldIndex != null);
  if (!screen) throw new Error('dataset has no overworld screen');
  return screen;
};

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

const contextFor = (o: ScreenObservations): DetectionContext =>
  ({ origin: 'live', screenId: o.match?.screen.id ?? null, observations: o });

const palaceScanMatch = (screen: ScreenRecord): ScreenMatchResult => ({
  screen,
  method: 'palace-scan',
  palaceMismatch: { expected: screen.gameId.palaceIndex as number, actual: WRONG_PALACE },
});

const detector = detectorFromStrategy(screenStrategy);

describeDataset('screen strategy parity with screen-identity on palace mismatches', () => {
  beforeEach(() => { clearPalaceMismatches(); });

  it('proposes the live palace index for exactly the mismatch the correction described', () => {
    const screen = dungeonScreen();
    const match = palaceScanMatch(screen);
    const liveGameId = { ...screen.gameId, palaceIndex: WRONG_PALACE };
    const drafts = detector.detect(contextFor(observations({ match, liveGameId, isIndoors: true })));
    const palaceDraft = drafts.find(d => d.key === 'gameId.palaceIndex');

    expect(palaceDraft).toBeDefined();
    expect(palaceDraft?.targetId).toBe(screen.id);
    expect(palaceDraft?.action).toBe('update');
    expect(palaceDraft?.confidence).toBe('certain');
    expect((palaceDraft?.current as ScreenRecord).gameId.palaceIndex).toBe(screen.gameId.palaceIndex);
    expect((palaceDraft?.proposed as ScreenRecord).gameId.palaceIndex).toBe(WRONG_PALACE);
  });

  it('changes nothing else about the record it patches', () => {
    const screen = dungeonScreen();
    const match = palaceScanMatch(screen);
    const liveGameId = { ...screen.gameId, palaceIndex: WRONG_PALACE };
    const [draft] = detector.detect(contextFor(observations({ match, liveGameId, isIndoors: true })))
      .filter(d => d.key === 'gameId.palaceIndex');
    const proposed = draft.proposed as ScreenRecord;

    expect({ ...proposed, gameId: null }).toEqual({ ...screen, gameId: null });
    expect(proposed.gameId).toEqual({ ...screen.gameId, palaceIndex: WRONG_PALACE });
  });

  it('says nothing when the record and the game agree', () => {
    const screen = dungeonScreen();
    const match: ScreenMatchResult = { screen, method: 'exact' };
    expect(detector.detect(contextFor(observations({ match, liveGameId: screen.gameId, isIndoors: true })))).toEqual([]);
  });

  it('turns a recorded fallback hit into a fix, with no live match at all', () => {
    const screen = dungeonScreen();
    const room = screen.gameId.roomIndex as number;
    scanForRoom(getScreenLookup().byDungeonRoom, room, WRONG_PALACE);
    const recorded = [...getPalaceMismatches().values()];
    expect(recorded.length).toBeGreaterThan(0);

    const drafts = detector.detect(contextFor(observations({ palaceMismatches: recorded })));
    expect(drafts.length).toBeGreaterThan(0);
    for (const d of drafts) {
      const target = findOne('screen', s => s.id === d.targetId);
      expect(target).toBeDefined();
      expect((d.proposed as ScreenRecord).gameId.palaceIndex).toBe(WRONG_PALACE);
    }
  });

  it('emits one finding, not two, when the map and the live match name the same screen', () => {
    const screen = dungeonScreen();
    const room = screen.gameId.roomIndex as number;
    scanForRoom(getScreenLookup().byDungeonRoom, room, WRONG_PALACE);
    const recorded = [...getPalaceMismatches().values()];
    const match = palaceScanMatch(screen);
    const liveGameId = { ...screen.gameId, palaceIndex: WRONG_PALACE };

    const drafts = detector.detect(contextFor(observations({ match, palaceMismatches: recorded, liveGameId, isIndoors: true })));
    const forScreen = drafts.filter(d => d.targetId === screen.id && d.key === 'gameId.palaceIndex');
    expect(forScreen).toHaveLength(1);
  });

  it('proposes a fix for a palace mismatch on a screen that is NOT the current one, which is the bug the old detector had', () => {
    const current = dungeonScreen();
    const other = dungeonScreen(current.id);
    const room = other.gameId.roomIndex as number;
    scanForRoom(getScreenLookup().byDungeonRoom, room, WRONG_PALACE);
    const recorded = [...getPalaceMismatches().values()];
    const match: ScreenMatchResult = { screen: current, method: 'exact' };

    const drafts = detector.detect(contextFor(observations({
      match, palaceMismatches: recorded, liveGameId: current.gameId, isIndoors: true,
    })));
    const otherDraft = drafts.find(d => d.targetId === other.id && d.key === 'gameId.palaceIndex');
    expect(otherDraft).toBeDefined();
    expect((otherDraft?.proposed as ScreenRecord).gameId.palaceIndex).toBe(WRONG_PALACE);
  });
});

describeDataset('screen strategy: a WRONG value is reported, not just a missing one', () => {
  it('reports a wrong roomIndex', () => {
    const screen = dungeonScreen();
    const match: ScreenMatchResult = { screen, method: 'exact' };
    const wrongRoom = (screen.gameId.roomIndex as number) ^ 0x1;
    const liveGameId = { ...screen.gameId, roomIndex: wrongRoom };

    const drafts = detector.detect(contextFor(observations({ match, liveGameId, isIndoors: true })));
    const roomDrafts = drafts.filter(d => d.key === 'gameId.roomIndex');
    expect(roomDrafts).toHaveLength(1);
    expect(roomDrafts[0].confidence).toBe('certain');
    expect((roomDrafts[0].proposed as ScreenRecord).gameId.roomIndex).toBe(wrongRoom);
  });

  it('reports a wrong overworldIndex outdoors', () => {
    const screen = overworldScreen();
    const match: ScreenMatchResult = { screen, method: 'overworld' };
    const wrongOw = (screen.gameId.overworldIndex as number) ^ 0x1;
    const liveGameId = { ...screen.gameId, overworldIndex: wrongOw };

    const drafts = detector.detect(contextFor(observations({ match, liveGameId, isIndoors: false })));
    const owDrafts = drafts.filter(d => d.key === 'gameId.overworldIndex');
    expect(owDrafts).toHaveLength(1);
    expect((owDrafts[0].proposed as ScreenRecord).gameId.overworldIndex).toBe(wrongOw);
  });

  it('never compares overworldIndex indoors, because the RAM slot is stale, leftover from the last outdoor screen', () => {
    const screen = dungeonScreen();
    const match: ScreenMatchResult = { screen, method: 'exact' };
    const liveGameId = { ...screen.gameId, overworldIndex: 0x3f };

    const drafts = detector.detect(contextFor(observations({ match, liveGameId, isIndoors: true })));
    expect(drafts.filter(d => d.key === 'gameId.overworldIndex')).toEqual([]);
  });

  it('reports the live entrance id when this room was entered directly', () => {
    const screen = dungeonScreen();
    const match: ScreenMatchResult = { screen, method: 'exact' };
    const room = screen.gameId.roomIndex as number;
    const liveGameId = { ...screen.gameId, entranceId: 0x2b };
    const entranceRooms: number[] = [];
    entranceRooms[0x2b] = room;

    const drafts = detector.detect(contextFor(observations({ match, liveGameId, isIndoors: true, entranceRooms })));
    const entranceDrafts = drafts.filter(d => d.key === 'gameId.entranceId');
    expect(entranceDrafts).toHaveLength(1);
    expect((entranceDrafts[0].proposed as ScreenRecord).gameId.entranceId).toBe(0x2b);
  });

  it('does NOT compare entranceId when the room was entered indirectly (walked in from another indoor room)', () => {
    const screen = dungeonScreen();
    const match: ScreenMatchResult = { screen, method: 'exact' };
    const room = screen.gameId.roomIndex as number;
    const liveGameId = { ...screen.gameId, entranceId: 0x2b };
    const entranceRooms: number[] = [];
    entranceRooms[0x2b] = room + 1; // stale, because entrance 0x2b actually leads elsewhere

    const drafts = detector.detect(contextFor(observations({ match, liveGameId, isIndoors: true, entranceRooms })));
    expect(drafts.filter(d => d.key === 'gameId.entranceId')).toEqual([]);
  });

  it('does not compare entranceId at all without an entranceRooms observation, since absent means "not read"', () => {
    const screen = dungeonScreen();
    const match: ScreenMatchResult = { screen, method: 'exact' };
    const liveGameId = { ...screen.gameId, entranceId: 0x2b };

    const drafts = detector.detect(contextFor(observations({ match, liveGameId, isIndoors: true })));
    expect(drafts.filter(d => d.key === 'gameId.entranceId')).toEqual([]);
  });
});

describeDataset('screen strategy: kind, and authoring gaps the game cannot settle', () => {
  it('proposes overworld kind for an outdoor screen when the record disagrees', () => {
    const screen = overworldScreen();
    const match: ScreenMatchResult = { screen: { ...screen, kind: 'dungeon' } as ScreenRecord, method: 'overworld' };
    const drafts = detector.detect(contextFor(observations({ match, liveGameId: screen.gameId, isIndoors: false })));
    expect(drafts.some(d => d.key === 'kind')).toBe(true);
  });

  it('never proposes a kind indoors, because the game cannot distinguish dungeon/interior/cave', () => {
    const screen = dungeonScreen();
    const match: ScreenMatchResult = { screen, method: 'exact' };
    const drafts = detector.detect(contextFor(observations({ match, liveGameId: screen.gameId, isIndoors: true })));
    expect(drafts.filter(d => d.key === 'kind')).toEqual([]);
  });

  it('leaves authoring gaps alone, since no native value answers them', () => {
    const screen = dungeonScreen();
    const bare: ScreenRecord = { ...screen, tags: [] };
    const match: ScreenMatchResult = { screen: bare, method: 'exact' };
    expect(detector.detect(contextFor(observations({ match, liveGameId: bare.gameId, isIndoors: true })))).toEqual([]);
  });
});
