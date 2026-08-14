/* @layer test @kind test */
/**
 * The `dungeon` strategy's room-screens field probe: the loaded room
 * resolves to a dungeon whose roomScreenIds does not list this screen.
 *
 * Ported from the hand-written `dungeon-rooms` detector (deleted) onto the
 * declarative comparison engine — `strategy:dungeon` is the detector id now.
 * The probe's live value is "the screen we are currently on", which a
 * `FieldProbe` can only read off `observations.match?.screen.id` (see
 * `rooms.probe.ts`'s own header for why), so unlike the original detector's
 * bare `screenId` context argument, `contextFor` here also builds a matching
 * `ScreenMatchResult` — exactly what production always carries in lockstep
 * with `context.screenId` (`use-screen-observations.ts`).
 */
import { describe, it, expect } from 'vitest';
import { all, getScreen } from '@shared/game/data';
import type { DungeonRecord, ScreenId } from '@shared/game/data';
import type { DetectionContext, ScreenObservations } from '@shared/game/recommendations';
import { detectorFromStrategy } from '@shared/game/recommendations/compare';
import { dungeonStrategy } from '@shared/game/recommendations/strategies/dungeon';
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

/** Mirrors `use-screen-observations.ts`: `context.screenId` and
 *  `observations.match?.screen.id` always agree in production. */
const contextFor = (screenId: ScreenId | null, o: Partial<ScreenObservations>): DetectionContext => {
  const match = screenId ? { screen: getScreen(screenId), method: 'exact' as const } : null;
  return { origin: 'live', screenId, observations: observations({ match, ...o }) };
};

const aDungeon = (): DungeonRecord => {
  const dungeon = all('dungeon').find(d => d.gameId.palaceIndex != null && d.roomScreenIds.length > 0);
  if (!dungeon) throw new Error('dataset has no dungeon with both a palaceIndex and member screens');
  return dungeon;
};

const detector = detectorFromStrategy(dungeonStrategy);

describeDataset('dungeon strategy (room-screens probe)', () => {
  it('proposes adding the current screen when the room resolves to a dungeon that does not list it', () => {
    const dungeon = aDungeon();
    const missingScreen = all('screen').find(s => !dungeon.roomScreenIds.includes(s.id));
    if (!missingScreen) throw new Error('every screen is already a member of this dungeon');

    const drafts = detector.detect(contextFor(missingScreen.id, {
      liveGameId: { palaceIndex: dungeon.gameId.palaceIndex },
    }));

    expect(drafts).toHaveLength(1);
    const [draft] = drafts;
    expect(draft.action).toBe('update');
    expect(draft.targetId).toBe(dungeon.id);
    expect(draft.detector).toBe('strategy:dungeon');
    expect(draft.confidence).toBe('certain');
    expect((draft.current as DungeonRecord).roomScreenIds).not.toContain(missingScreen.id);
    expect((draft.proposed as DungeonRecord).roomScreenIds).toContain(missingScreen.id);
    // Nothing else about the record changes.
    expect((draft.proposed as DungeonRecord).roomScreenIds.length).toBe(dungeon.roomScreenIds.length + 1);
  });

  it('proposes nothing when the screen is already a member of the resolved dungeon', () => {
    const dungeon = aDungeon();
    const memberScreen = dungeon.roomScreenIds[0];
    const drafts = detector.detect(contextFor(memberScreen, {
      liveGameId: { palaceIndex: dungeon.gameId.palaceIndex },
    }));
    expect(drafts).toEqual([]);
  });

  it('proposes nothing when the palace index resolves to no dungeon record', () => {
    const noSuchPalace = Math.max(...all('dungeon').map(d => d.gameId.palaceIndex ?? 0)) + 5;
    const drafts = detector.detect(contextFor('screen-001' as ScreenId, {
      liveGameId: { palaceIndex: noSuchPalace },
    }));
    expect(drafts).toEqual([]);
  });

  it('stays silent without a live palace index or a resolved screen', () => {
    const dungeon = aDungeon();
    expect(detector.detect(contextFor(null, { liveGameId: { palaceIndex: dungeon.gameId.palaceIndex } }))).toEqual([]);
    expect(detector.detect(contextFor('screen-001' as ScreenId, { liveGameId: null }))).toEqual([]);
  });
});
