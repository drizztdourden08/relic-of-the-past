/* @layer renderer-app @kind logic */
import { locationDisplayName } from '@rotp/randomizer';
import type { LocationKey } from '@rotp/randomizer';
import { trackerCheckOf } from './rotp-tracker-check-of';

const rotpLabelOf = (location: string): string =>
  trackerCheckOf(location)?.name ?? locationDisplayName(location as LocationKey);

export { rotpLabelOf };
