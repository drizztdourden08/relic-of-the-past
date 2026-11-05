/* @layer renderer-app @kind logic */
import { getGroupValue } from '@rotp/game-data';
import type { GroupDimension } from '@rotp/game-data';
import { itemKeyName, locationDisplayName } from '@rotp/randomizer';
import type { ItemKey, LocationKey } from '@rotp/randomizer';
import { trackerCheckOf } from './rotp-tracker-check-of';
import { TRACKER_EVENT_KIND, UNGROUPED } from './rotp-tracker.constants';

const rotpLabelOf = (location: string): string =>
  trackerCheckOf(location)?.name ?? locationDisplayName(location as LocationKey);

const rotpItemLabelOf = (item: string): string => itemKeyName(item as ItemKey);

const rotpGroupOf = (location: string, grouping: string): string => {
  const check = trackerCheckOf(location);
  return check === undefined ? UNGROUPED : getGroupValue(check, grouping as GroupDimension);
};

const rotpKindOf = (location: string): 'item' | 'event' =>
  trackerCheckOf(location)?.kind === TRACKER_EVENT_KIND ? 'event' : 'item';

export { rotpGroupOf, rotpItemLabelOf, rotpKindOf, rotpLabelOf };
