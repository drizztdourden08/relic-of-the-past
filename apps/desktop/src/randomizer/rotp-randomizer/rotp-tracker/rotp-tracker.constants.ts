/* @layer renderer-app @kind constants */
import { GROUP_DIMENSIONS } from '@rotp/game-data';
import { BIG_KEY_DOORS, DARK_ROOMS_NEED_LIGHT, SMALL_KEY_DOORS } from '@rotp/randomizer';
import type {
  TrackerAssumption, TrackerGrouping,
} from '@drizztdourden08/brock-randomizer/tracker';

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
  FACET_CATEGORY_LABELS, NOW_BADGE_ID, ROTP_ASSUMPTIONS, ROTP_GROUPINGS,
  SWAP_BADGE_ID, TRACKER_EVENT_KIND, UNGROUPED,
};
