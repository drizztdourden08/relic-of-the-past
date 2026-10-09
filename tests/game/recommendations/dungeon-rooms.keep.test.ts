/* @layer test @kind test */
import { describe, it, expect } from 'vitest';
import { all, getScreen } from '@rotp/game-data';
import type { DungeonRecord, ScreenId } from '@rotp/game-data';
import type { DetectionContext, ScreenObservations } from '@rotp/navigation';
import { detectorFromStrategy } from '@rotp/navigation';
import { dungeonStrategy } from '@rotp/navigation';
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
