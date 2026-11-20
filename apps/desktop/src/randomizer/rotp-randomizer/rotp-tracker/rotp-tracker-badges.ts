/* @layer renderer-app @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { chestSwapOf, getItem } from '@rotp/game-data';
import type { CheckId, CheckRecord } from '@rotp/game-data';
import type { TrackerBadge } from '@drizztdourden08/brock-randomizer/tracker';
import { getCompletedChecks, getEventStatus } from '@app/game/tracker';
import { textOf } from '@app/shell/text-bridge';
import { trackerCheckOf } from './rotp-tracker-check-of';
import { NOW_BADGE_ID, SWAP_BADGE_ID } from './rotp-tracker.constants';
import { NO_BADGES } from './rotp-tracker-badges.constants';

const swapBadge = (check: CheckRecord, item: string | null): TrackerBadge[] => {
  const swap = chestSwapOf(check);
  if (swap === null) return [];
  const values = { primary: getItem(swap.primary).name, standIn: getItem(swap.standIn).name };
  const swapped = item === swap.standIn;
  const title = textOf(swapped ? msg('views-randomizer:tracker.swap.already', values) : msg('views-randomizer:tracker.swap.pending', values));
  return [{ id: SWAP_BADGE_ID, label: textOf(msg('views-randomizer:tracker.badge.swap')), tone: swapped ? 'warning' : 'neutral', title }];
};

const presenceBadge = (checkId: string): TrackerBadge[] => {
  const now = getEventStatus().get(checkId as CheckId);
  if (now === undefined) return [];
  if (now) return [{ id: NOW_BADGE_ID, label: textOf(msg('views-randomizer:tracker.badge.now')), tone: 'success' }];
  return getCompletedChecks().has(checkId as CheckId)
    ? [{ id: NOW_BADGE_ID, label: textOf(msg('views-randomizer:tracker.badge.not-now')), tone: 'neutral' }]
    : [];
};

const rotpBadgesOf = (location: string, item: string | null): readonly TrackerBadge[] => {
  const check = trackerCheckOf(location);
  if (check === undefined) return NO_BADGES;
  return [...swapBadge(check, item), ...presenceBadge(check.id)];
};

export { rotpBadgesOf };
