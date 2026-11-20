/* @layer renderer-app @kind logic */
import { locationDisplayName } from '@rotp/randomizer';
import type { LocationKey } from '@rotp/randomizer';
import { checkName } from '@app/game/record-text';
import { trackerCheckOf } from './rotp-tracker-check-of';

const rotpLabelOf = (location: string): string => {
  const check = trackerCheckOf(location);
  return check ? checkName(check) : locationDisplayName(location as LocationKey);
};

export { rotpLabelOf };
