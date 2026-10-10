/* @layer test @kind test */
import { it, expect } from 'vitest';
import type { ScreenRecord, ScreenMatchResult } from '@rotp/game-data';
import { describeDataset } from '../../../dataset-guard';
import { required } from '../../../required';
import { contextFor } from './context-for';
import { dungeonScreen } from './dungeon-screen';
import { observations } from './observations';
import { overworldScreen } from './overworld-screen';
import { screenDetector as detector } from './screen-detector';

const entranceRoomsLeadingTo = (room: number): number[] => {
  const entranceRooms: number[] = [];
  entranceRooms[0x2b] = room;
  return entranceRooms;
};

describeDataset('screen strategy: a WRONG value is reported, not just a missing one', () => {
  it('reports a wrong roomIndex', () => {
    const screen = dungeonScreen();
    const match: ScreenMatchResult = { screen, method: 'exact' };
    const wrongRoom = (screen.gameId.roomIndex as number) ^ 0x1;
    const liveGameId = { ...screen.gameId, roomIndex: wrongRoom };

    const drafts = detector.detect(contextFor(observations({ match, liveGameId, isIndoors: true })));
    const roomDrafts = drafts.filter(d => d.key === 'gameId.roomIndex');
    expect(roomDrafts).toHaveLength(1);
    const roomDraft = required(roomDrafts[0], 'the roomIndex draft');
    expect(roomDraft.confidence).toBe('certain');
    expect((roomDraft.proposed as ScreenRecord).gameId.roomIndex).toBe(wrongRoom);
  });

  it('reports a wrong overworldIndex outdoors', () => {
    const screen = overworldScreen();
    const match: ScreenMatchResult = { screen, method: 'overworld' };
    const wrongOw = (screen.gameId.overworldIndex as number) ^ 0x1;
    const liveGameId = { ...screen.gameId, overworldIndex: wrongOw };

    const drafts = detector.detect(contextFor(observations({ match, liveGameId, isIndoors: false })));
    const owDrafts = drafts.filter(d => d.key === 'gameId.overworldIndex');
    expect(owDrafts).toHaveLength(1);
    expect((required(owDrafts[0], 'the overworldIndex draft').proposed as ScreenRecord).gameId.overworldIndex).toBe(wrongOw);
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
    const entranceRooms = entranceRoomsLeadingTo(room);

    const drafts = detector.detect(contextFor(observations({ match, liveGameId, isIndoors: true, entranceRooms })));
    const entranceDrafts = drafts.filter(d => d.key === 'gameId.entranceId');
    expect(entranceDrafts).toHaveLength(1);
    expect((required(entranceDrafts[0], 'the entranceId draft').proposed as ScreenRecord).gameId.entranceId).toBe(0x2b);
  });

  it('does NOT compare entranceId when the room was entered indirectly (walked in from another indoor room)', () => {
    const screen = dungeonScreen();
    const match: ScreenMatchResult = { screen, method: 'exact' };
    const room = screen.gameId.roomIndex as number;
    const liveGameId = { ...screen.gameId, entranceId: 0x2b };
    const roomEntrance0x2bLeadsTo = room + 1;
    const entranceRooms = entranceRoomsLeadingTo(roomEntrance0x2bLeadsTo);

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
