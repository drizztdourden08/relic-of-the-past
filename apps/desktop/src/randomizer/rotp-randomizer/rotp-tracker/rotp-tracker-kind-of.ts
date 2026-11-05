/* @layer renderer-app @kind logic */
import { trackerCheckOf } from './rotp-tracker-check-of';
import { TRACKER_EVENT_KIND } from './rotp-tracker.constants';

const rotpKindOf = (location: string): 'item' | 'event' =>
  trackerCheckOf(location)?.kind === TRACKER_EVENT_KIND ? 'event' : 'item';

export { rotpKindOf };
