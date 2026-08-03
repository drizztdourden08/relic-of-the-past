/* @layer test @kind test */
/**
 * The screen-identity detector against the two mechanisms it revives: the
 * `DataCorrection` list `screenDataStatus` computed and nothing ever read, and
 * the palace-mismatch map the detection fallback filled and only ever logged.
 *
 * Parity here means the detector agrees about WHICH screens are wrong, and
 * proposes the value the correction could only describe.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { all, findOne } from '@shared/game/data';
import type { ScreenRecord } from '@shared/game/data';
import type { ScreenMatchResult } from '@shared/game/logic/queries/detection';
import { getScreenLookup } from '@shared/game/logic/queries/detection';
import { clearPalaceMismatches, getPalaceMismatches, scanForRoom } from '@shared/game/logic/queries/palace-fallback';
import type { DetectionContext, ScreenObservations } from '@shared/game/recommendations';
import { screenDataStatus } from '@app/ui/domains/widgets/navigation/screen-data-status';
import { screenIdentityDetector } from '@app/ui/domains/widgets/navigation/recommendations/detectors/screen-identity';

/**
 * A palace index no record uses, so "the game says X, the record says Y" is
 * genuinely a disagreement for every screen — a hardcoded value silently
 * matched a real one and made the fixture assert nothing.
 */
const WRONG_PALACE = Math.max(
  ...all('screen').map(s => s.gameId.palaceIndex ?? 0),
) + 2;

const dungeonScreen = (): ScreenRecord => {
  const screen = all('screen').find(s => s.kind === 'dungeon' && s.gameId.roomIndex != null && s.gameId.palaceIndex != null);
  if (!screen) throw new Error('dataset has no dungeon screen with both native values');
  return screen;
};

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

const contextFor = (o: ScreenObservations): DetectionContext =>
  ({ origin: 'live', screenId: o.match?.screen.id ?? null, observations: o });

const palaceScanMatch = (screen: ScreenRecord): ScreenMatchResult => ({
  screen,
  method: 'palace-scan',
  palaceMismatch: { expected: screen.gameId.palaceIndex as number, actual: WRONG_PALACE },
});

describe('screen-identity detector parity with screenDataStatus', () => {
  beforeEach(() => { clearPalaceMismatches(); });

  it('proposes the live palace index for exactly the mismatch the correction described', () => {
    const screen = dungeonScreen();
    const match = palaceScanMatch(screen);
    const status = screenDataStatus(match, true);

    // The original mechanism: a correction naming the field, and nothing else.
    expect(status.corrections.map(c => c.field)).toContain('gameId.palaceIndex');
    expect(status.status).toBe('incomplete');

    const drafts = screenIdentityDetector.detect(contextFor(observations({ match, liveGameId: screen.gameId })));
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
    const [draft] = screenIdentityDetector.detect(contextFor(observations({ match, liveGameId: screen.gameId })));
    const proposed = draft.proposed as ScreenRecord;

    expect({ ...proposed, gameId: null }).toEqual({ ...screen, gameId: null });
    expect(proposed.gameId).toEqual({ ...screen.gameId, palaceIndex: WRONG_PALACE });
  });

  it('says nothing when the record and the game agree', () => {
    const screen = dungeonScreen();
    const match: ScreenMatchResult = { screen, method: 'exact' };
    expect(screenDataStatus(match, true).corrections).toEqual([]);
    expect(screenIdentityDetector.detect(contextFor(observations({ match, liveGameId: screen.gameId })))).toEqual([]);
  });
});

describe('screen-identity detector reads the palace-fallback map nothing else consumed', () => {
  beforeEach(() => { clearPalaceMismatches(); });

  it('turns a recorded fallback hit into a fix, with no live match at all', () => {
    const screen = dungeonScreen();
    const room = screen.gameId.roomIndex as number;
    // Drive the real fallback so the map is filled the way detection fills it.
    scanForRoom(getScreenLookup().byDungeonRoom, room, WRONG_PALACE);
    const recorded = [...getPalaceMismatches().values()];
    expect(recorded.length).toBeGreaterThan(0);

    const drafts = screenIdentityDetector.detect(contextFor(observations({ palaceMismatches: recorded })));
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

    const drafts = screenIdentityDetector.detect(contextFor(observations({ match, palaceMismatches: recorded, liveGameId: screen.gameId })));
    const forScreen = drafts.filter(d => d.targetId === screen.id && d.key === 'gameId.palaceIndex');
    expect(forScreen).toHaveLength(1);
  });
});

describe('screen-identity detector only proposes what the game can settle', () => {
  beforeEach(() => { clearPalaceMismatches(); });

  it('supplies the live entrance id the ambiguous-cave correction could only name', () => {
    const cave = all('screen').find(s => s.kind === 'interior' && s.gameId.roomIndex != null);
    if (!cave) return;
    const match: ScreenMatchResult = { screen: cave, method: 'cave-ambiguous' };

    expect(screenDataStatus(match, true).corrections.find(c => c.field === 'gameId.entranceId')?.suggestedValue).toBeNull();

    const live = { ...cave.gameId, entranceId: 0x2b };
    const [draft] = screenIdentityDetector.detect(contextFor(observations({ match, liveGameId: live })))
      .filter(d => d.key === 'gameId.entranceId');

    expect(draft).toBeDefined();
    expect((draft.proposed as ScreenRecord).gameId.entranceId).toBe(0x2b);
    expect(draft.confidence).toBe('certain');
  });

  it('proposes nothing at all without the live native values', () => {
    const cave = all('screen').find(s => s.kind === 'interior' && s.gameId.roomIndex != null);
    if (!cave) return;
    const match: ScreenMatchResult = { screen: cave, method: 'cave-ambiguous' };
    expect(screenIdentityDetector.detect(contextFor(observations({ match, liveGameId: null })))).toEqual([]);
  });

  it('leaves authoring gaps as issues, since no native value answers them', () => {
    const screen = dungeonScreen();
    const bare: ScreenRecord = { ...screen, tags: [] };
    const match: ScreenMatchResult = { screen: bare, method: 'exact' };

    // The original still reports it…
    expect(screenDataStatus(match, true).issues).toContain('No tags');
    // …and the detector proposes nothing, because inventing tags is guessing.
    expect(screenIdentityDetector.detect(contextFor(observations({ match, liveGameId: bare.gameId })))).toEqual([]);
  });
});
