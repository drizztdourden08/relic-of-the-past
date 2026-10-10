/* @layer test @kind test */
import { it, expect, beforeEach } from 'vitest';
import { findOne, getScreenLookup, clearPalaceMismatches, getPalaceMismatches, scanForRoom } from '@rotp/game-data';
import type { ScreenRecord, ScreenMatchResult } from '@rotp/game-data';
import { describeDataset } from '../../../dataset-guard';
import { WRONG_PALACE } from './screen-strategy-parity.constants';
import { contextFor } from './context-for';
import { dungeonScreen } from './dungeon-screen';
import { observations } from './observations';
import { palaceScanMatch } from './palace-scan-match';
import { screenDetector as detector } from './screen-detector';

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
