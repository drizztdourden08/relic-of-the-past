/* @layer shared-game @kind logic */
/**
 * The `dungeon` comparison strategy — replaces the `dungeon-rooms.ts`
 * detector (deleted): the loaded room resolves to a dungeon whose
 * `roomScreenIds` does not list this screen.
 *
 * `subjects` resolves to at most the ONE dungeon the currently loaded room's
 * own palace index names — no other dungeon record has anything to say about
 * this room, so there is nothing else to compare. No new observation was
 * needed for this: the live palace index the game reports is already carried
 * on `liveGameId` (screen-identity's own ground truth for the same fact).
 */
import { getDungeonByGameId } from '../../../data';
import type { DungeonRecord, ScreenId } from '../../../data';
import type { ComparisonStrategy } from '../../compare/probe.types';
import type { ScreenObservations } from '../../detection-types';
import { ROOM_SCREENS_PROBE } from './rooms.probe';

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
  fields: [ROOM_SCREENS_PROBE],
  sets: [],
};

export { dungeonStrategy };
