/* @layer shared-game @kind logic */
import { getDungeonByGameId } from '../../../data';
import type { DungeonRecord, ScreenId } from '../../../data';
import type { ComparisonStrategy } from '../../compare/probe.type';
import type { ScreenObservations } from '../../detection-types';
import { roomScreensProbe } from './rooms.probe';

const subjectsFor = (observations: ScreenObservations, screenId: ScreenId | null): readonly DungeonRecord[] => {
  if (!screenId) return [];
  const palaceIndex = observations.liveGameId?.palaceIndex;
  if (palaceIndex == null) return [];
  const dungeon = getDungeonByGameId({ palaceIndex });
  return dungeon ? [dungeon] : [];
};

const dungeonStrategy: ComparisonStrategy<'dungeon'> = {
  kind: 'dungeon',
  subjects: subjectsFor,
  fields: [roomScreensProbe],
  sets: [],
};

export { dungeonStrategy };
