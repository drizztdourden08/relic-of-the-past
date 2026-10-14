/* @layer renderer-widgets @kind logic */
import { find } from '@rotp/game-data';
import type { DetectionContext } from '@rotp/navigation';
import { NO_LIVE_RECORDS } from '../LiveDataInspector.constants';
import type { LiveRecord } from '../LiveDataInspector.type';

const checkRecords = (context: DetectionContext): readonly LiveRecord[] => {
  const { screenId } = context;
  return screenId ? find('check', check => check.screenId === screenId) : NO_LIVE_RECORDS;
};

export { checkRecords };
