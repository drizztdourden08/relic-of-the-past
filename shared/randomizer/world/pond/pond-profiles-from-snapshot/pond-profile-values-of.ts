/* @layer shared-game @kind logic */
import { POND_INSTANCES } from '../pond-instances';
import { POND_SHARE_KEY } from '../pond-share';
import { pondValuesOf } from '../pond-from-snapshot';
import type { OptionValue } from '../../options.type';
import type { PondProfiles } from '../pond-profiles.type';

const pondProfileValuesOf = (
  profiles: PondProfiles, shared = false,
): Record<string, OptionValue> => ({
  ...Object.assign({}, ...POND_INSTANCES.map((pond) => pondValuesOf(profiles[pond.id], pond))) as
    Record<string, OptionValue>,
  [POND_SHARE_KEY]: shared,
});

export { pondProfileValuesOf };
