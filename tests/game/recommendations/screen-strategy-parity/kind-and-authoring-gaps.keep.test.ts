/* @layer test @kind test */
import { it, expect } from 'vitest';
import type { ScreenRecord } from '@rotp/game-data';
import type { ScreenMatchResult } from '@rotp/game-data';
import { describeDataset } from '../../../dataset-guard';
import { contextFor } from './context-for';
import { dungeonScreen } from './dungeon-screen';
import { observations } from './observations';
import { overworldScreen } from './overworld-screen';
import { screenDetector as detector } from './screen-detector';

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
