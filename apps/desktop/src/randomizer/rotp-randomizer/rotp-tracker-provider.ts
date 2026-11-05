/* @layer renderer-app @kind logic */
import { normalPlacement } from '@rotp/navigation';
import type { Placement } from '@rotp/randomizer';
import type { TrackerProvider } from '@drizztdourden08/brock-randomizer/tracker';
import { rotpAssumedHeld } from './rotp-tracker/rotp-tracker-assumed';
import { rotpArtOf } from './rotp-tracker/rotp-tracker-art';
import { rotpBadgesOf } from './rotp-tracker/rotp-tracker-badges';
import { ROTP_FACETS, rotpFacetsOf } from './rotp-tracker/rotp-tracker-facets';
import { rotpGroupOf, rotpItemLabelOf, rotpKindOf, rotpLabelOf } from './rotp-tracker/rotp-tracker-labels';
import { rotpCompleted, rotpHeld, rotpSubscribe } from './rotp-tracker/rotp-tracker-live';
import { trackerLocationOf } from './rotp-tracker/rotp-tracker-location-of';
import { rotpPrime } from './rotp-tracker/rotp-tracker-prime';
import { rotpStatuses } from './rotp-tracker/rotp-tracker-statuses';
import { rotpWorld, rotpWorldKey } from './rotp-tracker/rotp-tracker-world';
import { ROTP_ASSUMPTIONS, ROTP_GROUPINGS } from './rotp-tracker/rotp-tracker.constants';

const rotpTrackerProvider: TrackerProvider<Placement> = {
  world: rotpWorld,
  worldKey: rotpWorldKey,
  vanilla: normalPlacement,
  locationOf: trackerLocationOf,
  assumedHeld: rotpAssumedHeld,
  prime: rotpPrime,
  checks: [],
  completed: rotpCompleted,
  held: rotpHeld,
  subscribe: rotpSubscribe,
  assumptions: ROTP_ASSUMPTIONS,
  groupings: ROTP_GROUPINGS,
  groupOf: rotpGroupOf,
  labelOf: rotpLabelOf,
  itemLabelOf: rotpItemLabelOf,
  artOf: rotpArtOf,
  facets: ROTP_FACETS,
  facetsOf: rotpFacetsOf,
  kindOf: rotpKindOf,
  badgesOf: rotpBadgesOf,
  statusesOf: rotpStatuses,
};

export { rotpTrackerProvider };
