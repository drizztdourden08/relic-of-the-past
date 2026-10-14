/* @layer renderer-widgets @kind logic */
import { getDungeonByGameId } from '@rotp/game-data';
import type { DetectionContext } from '@rotp/navigation';
import { NO_LIVE_RECORDS } from '../LiveDataInspector.constants';
import type { LiveRecord } from '../LiveDataInspector.type';

const dungeonRecords = (context: DetectionContext): readonly LiveRecord[] => {
  const { observations } = context;
  const palaceIndex = observations.liveGameId?.palaceIndex;
  if (!observations.isIndoors || palaceIndex == null) return NO_LIVE_RECORDS;
  const dungeon = getDungeonByGameId({ palaceIndex });
  return dungeon ? [dungeon] : NO_LIVE_RECORDS;
};

export { dungeonRecords };
