/* @layer renderer-app @kind logic */
import { normalPlacement } from '@rotp/navigation';
import { placementReadingProvider } from '@rotp/randomizer';
import type { Placement } from '@rotp/randomizer';
import type { TrackerProvider } from '@drizztdourden08/brock-randomizer/tracker';
import { rotpArtOf } from './rotp-tracker/rotp-tracker-art';
import { rotpBadgesOf } from './rotp-tracker/rotp-tracker-badges';
import { ROTP_FACETS } from './rotp-tracker/rotp-tracker-facets.constants';
import { rotpFacetsOf } from './rotp-tracker/rotp-tracker-facets-of';
import { rotpGroupOf } from './rotp-tracker/rotp-tracker-group-of';
import { rotpItemLabelOf } from './rotp-tracker/rotp-tracker-item-label-of';
import { rotpKindOf } from './rotp-tracker/rotp-tracker-kind-of';
import { rotpLabelOf } from './rotp-tracker/rotp-tracker-label-of';
import { rotpCompleted } from './rotp-tracker/rotp-tracker-completed';
import { rotpHeld } from './rotp-tracker/rotp-tracker-held';
import { rotpSubscribe } from './rotp-tracker/rotp-tracker-subscribe';
import { trackerLocationOf } from './rotp-tracker/rotp-tracker-location-of';
import { rotpStatuses } from './rotp-tracker/rotp-tracker-statuses';
import { ROTP_ASSUMPTIONS, ROTP_GROUPINGS } from './rotp-tracker/rotp-tracker.constants';

const rotpTrackerProvider: TrackerProvider<Placement> = {
  world: placementReadingProvider.world,
  worldKey: placementReadingProvider.worldKey,
  vanilla: normalPlacement,
  locationOf: trackerLocationOf,
  assumedHeld: placementReadingProvider.assumedHeld,
  prime: placementReadingProvider.prime,
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
