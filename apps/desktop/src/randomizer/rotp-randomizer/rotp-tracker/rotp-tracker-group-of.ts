/* @layer renderer-app @kind logic */
import { getGroupValue } from '@rotp/game-data';
import type { GroupDimension } from '@rotp/game-data';
import { textOf } from '@app/shell/text-bridge';
import { trackerCheckOf } from './rotp-tracker-check-of';
import { UNGROUPED } from './rotp-tracker.constants';

const rotpGroupOf = (location: string, grouping: string): string => {
  const check = trackerCheckOf(location);
  return check === undefined ? textOf(UNGROUPED) : getGroupValue(check, grouping as GroupDimension);
};

export { rotpGroupOf };
