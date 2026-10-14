/* @layer renderer-widgets @kind logic */
import { getScreen } from '@rotp/game-data';
import type { DetectionContext } from '@rotp/navigation';
import { NO_LIVE_RECORDS } from '../LiveDataInspector.constants';
import type { LiveRecord } from '../LiveDataInspector.type';

const screenRecords = (context: DetectionContext): readonly LiveRecord[] => {
  const { screenId } = context;
  const screen = screenId ? getScreen(screenId) : null;
  return screen ? [screen] : NO_LIVE_RECORDS;
};

export { screenRecords };
