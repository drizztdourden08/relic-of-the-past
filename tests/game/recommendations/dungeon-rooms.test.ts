/* @layer test @kind test */
/**
 * The dungeon-rooms detector: the loaded room resolves to a dungeon whose
 * roomScreenIds does not list this screen.
 */
import { describe, it, expect } from 'vitest';
import { all } from '@shared/game/data';
import type { DungeonRecord, ScreenId } from '@shared/game/data';
import type { DetectionContext, ScreenObservations } from '@shared/game/recommendations';
import { dungeonRoomsDetector } from '@shared/game/recommendations/detectors/dungeon-rooms';

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

const contextFor = (screenId: ScreenId | null, o: Partial<ScreenObservations>): DetectionContext =>
  ({ origin: 'live', screenId, observations: observations(o) });

const aDungeon = (): DungeonRecord => {
  const dungeon = all('dungeon').find(d => d.gameId.palaceIndex != null && d.roomScreenIds.length > 0);
  if (!dungeon) throw new Error('dataset has no dungeon with both a palaceIndex and member screens');
  return dungeon;
};

describe('dungeon-rooms detector', () => {
  it('proposes adding the current screen when the room resolves to a dungeon that does not list it', () => {
    const dungeon = aDungeon();
    const missingScreen = all('screen').find(s => !dungeon.roomScreenIds.includes(s.id));
    if (!missingScreen) throw new Error('every screen is already a member of this dungeon');

    const drafts = dungeonRoomsDetector.detect(contextFor(missingScreen.id, {
      liveGameId: { palaceIndex: dungeon.gameId.palaceIndex },
    }));

    expect(drafts).toHaveLength(1);
    const [draft] = drafts;
    expect(draft.action).toBe('update');
    expect(draft.targetId).toBe(dungeon.id);
    expect(draft.confidence).toBe('certain');
    expect((draft.current as DungeonRecord).roomScreenIds).not.toContain(missingScreen.id);
    expect((draft.proposed as DungeonRecord).roomScreenIds).toContain(missingScreen.id);
    // Nothing else about the record changes.
    expect((draft.proposed as DungeonRecord).roomScreenIds.length).toBe(dungeon.roomScreenIds.length + 1);
  });

  it('proposes nothing when the screen is already a member of the resolved dungeon', () => {
    const dungeon = aDungeon();
    const memberScreen = dungeon.roomScreenIds[0];
    const drafts = dungeonRoomsDetector.detect(contextFor(memberScreen, {
      liveGameId: { palaceIndex: dungeon.gameId.palaceIndex },
    }));
    expect(drafts).toEqual([]);
  });

  it('proposes nothing when the palace index resolves to no dungeon record', () => {
    const noSuchPalace = Math.max(...all('dungeon').map(d => d.gameId.palaceIndex ?? 0)) + 5;
    const drafts = dungeonRoomsDetector.detect(contextFor('screen-001' as ScreenId, {
      liveGameId: { palaceIndex: noSuchPalace },
    }));
    expect(drafts).toEqual([]);
  });

  it('stays silent without a live palace index or a resolved screen', () => {
    const dungeon = aDungeon();
    expect(dungeonRoomsDetector.detect(contextFor(null, { liveGameId: { palaceIndex: dungeon.gameId.palaceIndex } }))).toEqual([]);
    expect(dungeonRoomsDetector.detect(contextFor('screen-001' as ScreenId, { liveGameId: null }))).toEqual([]);
  });
});
