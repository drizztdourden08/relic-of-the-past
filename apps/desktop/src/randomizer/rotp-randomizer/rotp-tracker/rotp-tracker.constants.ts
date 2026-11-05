/* @layer renderer-app @kind constants */
import { GROUP_DIMENSIONS } from '@rotp/game-data';
import type {
  TrackerAssumption, TrackerGrouping,
} from '@drizztdourden08/brock-randomizer/tracker';

const SMALL_KEY_DOORS = 'small-key-doors';
const BIG_KEY_DOORS = 'big-key-doors';
const DARK_ROOMS_NEED_LIGHT = 'dark-rooms-need-light';

const ROTP_ASSUMPTIONS: readonly TrackerAssumption[] = [
  {
    id: SMALL_KEY_DOORS, label: 'Small Keys', initial: true,
    hint: 'On: rows past a key door wait for the keys the logic counts. Off: every small key door reads as open',
  },
  {
    id: BIG_KEY_DOORS, label: 'Big Keys', initial: true,
    hint: 'On: rows past a Big Key door wait for the key. Off: every Big Key door reads as open',
  },
  {
    id: DARK_ROOMS_NEED_LIGHT, label: 'Dark Rooms', initial: true,
    hint: 'On: rows past an unlit room wait for a light. Off: unlit rooms read as walked in the dark',
  },
];

const ROTP_GROUPINGS: readonly TrackerGrouping[] = GROUP_DIMENSIONS.map((dimension) => ({
  id: dimension.id, label: dimension.label, description: dimension.description,
}));

const FACET_CATEGORY_LABELS: Readonly<Record<string, string>> = {
  world: 'World', location: 'Location', area: 'Area', content: 'Content',
};

const UNGROUPED = 'Other';
const SWAP_BADGE_ID = 'swap';
const NOW_BADGE_ID = 'now';
const TRACKER_EVENT_KIND = 'event';

export {
  BIG_KEY_DOORS, DARK_ROOMS_NEED_LIGHT, FACET_CATEGORY_LABELS, NOW_BADGE_ID, ROTP_ASSUMPTIONS, ROTP_GROUPINGS,
  SMALL_KEY_DOORS, SWAP_BADGE_ID, TRACKER_EVENT_KIND, UNGROUPED,
};
