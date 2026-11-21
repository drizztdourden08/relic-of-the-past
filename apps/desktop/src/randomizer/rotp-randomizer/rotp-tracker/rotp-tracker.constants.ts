/* @layer renderer-app @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { GROUP_DIMENSIONS } from '@rotp/game-data';
import { BIG_KEY_DOORS, DARK_ROOMS_NEED_LIGHT, SMALL_KEY_DOORS } from '@rotp/randomizer';
import type {
  TrackerAssumption, TrackerGrouping,
} from '@drizztdourden08/brock-randomizer/tracker';
import { textOf } from '@app/shell/text-bridge';
import { GROUPING_TEXT } from './rotp-tracker-labels.constants';

const ROTP_ASSUMPTIONS: readonly TrackerAssumption[] = [
  {
    id: SMALL_KEY_DOORS, label: msg('compounds:tracker.logic.small-keys'), initial: true,
    hint: msg('compounds:tracker.logic.small-keys-title'),
  },
  {
    id: BIG_KEY_DOORS, label: msg('compounds:tracker.logic.big-keys'), initial: true,
    hint: msg('compounds:tracker.logic.big-keys-title'),
  },
  {
    id: DARK_ROOMS_NEED_LIGHT, label: msg('compounds:tracker.logic.dark-rooms'), initial: true,
    hint: msg('compounds:tracker.logic.dark-rooms-title'),
  },
];

const ROTP_GROUPINGS: readonly TrackerGrouping[] = GROUP_DIMENSIONS.map((dimension) => ({
  id: dimension.id,
  get label() {
    return textOf(GROUPING_TEXT[dimension.id]?.label ?? dimension.label);
  },
  get description() {
    return textOf(GROUPING_TEXT[dimension.id]?.description ?? dimension.description);
  },
}));

const UNGROUPED = msg('views-randomizer:tracker.group.other');
const SWAP_BADGE_ID = 'swap';
const NOW_BADGE_ID = 'now';
const TRACKER_EVENT_KIND = 'event';

export {
  NOW_BADGE_ID, ROTP_ASSUMPTIONS, ROTP_GROUPINGS,
  SWAP_BADGE_ID, TRACKER_EVENT_KIND, UNGROUPED,
};
