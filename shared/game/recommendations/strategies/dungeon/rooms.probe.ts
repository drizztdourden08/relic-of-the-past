/* @layer shared-game @kind logic */
import type { DungeonRecord } from '@rotp/game-data';
import { known, unread } from '../../compare/probe-reading';
import type { FieldProbe, Probe } from '../../compare/probe.type';
import type { ScreenObservations } from '../../detection-types';

const unionRoomScreenIds = (current: DungeonRecord['roomScreenIds'], screenId: string): DungeonRecord['roomScreenIds'] =>
  (current.includes(screenId as DungeonRecord['roomScreenIds'][number]) ? current : [...current, screenId as DungeonRecord['roomScreenIds'][number]]);

const readRoomScreenIds = (observations: ScreenObservations, record: DungeonRecord): Probe<unknown> => {
  const screenId = observations.match?.screen.id;
  if (!screenId) return unread();
  return known(unionRoomScreenIds(record.roomScreenIds, screenId));
};

const roomScreensProbe: FieldProbe<'dungeon'> = {
  path: 'roomScreenIds',
  label: 'Room screens',
  source: 'native:room-identity',
  confidence: 'certain',
  read: readRoomScreenIds,
};

export { roomScreensProbe };
