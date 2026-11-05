/* @layer renderer-app @kind logic */
import { chestSwapOf, getItem } from '@rotp/game-data';
import type { CheckId, CheckRecord } from '@rotp/game-data';
import type { TrackerBadge } from '@drizztdourden08/brock-randomizer/tracker';
import { getCompletedChecks, getEventStatus } from '@app/game/tracker';
import { trackerCheckOf } from './rotp-tracker-check-of';
import { NOW_BADGE_ID, SWAP_BADGE_ID } from './rotp-tracker.constants';

const NO_BADGES: readonly TrackerBadge[] = [];

const swapBadge = (check: CheckRecord, item: string | null): TrackerBadge[] => {
  const swap = chestSwapOf(check);
  if (swap === null) return [];
  const primary = getItem(swap.primary).name;
  const standIn = getItem(swap.standIn).name;
  const swapped = item === swap.standIn;
  const title = swapped
    ? `This chest holds the ${primary}. You already have one, so it pays ${standIn}.`
    : `This chest holds the ${primary}. Once you have one it pays ${standIn} instead.`;
  return [{ id: SWAP_BADGE_ID, label: 'swap', tone: swapped ? 'warning' : 'neutral', title }];
};

const presenceBadge = (checkId: string): TrackerBadge[] => {
  const now = getEventStatus().get(checkId as CheckId);
  if (now === undefined) return [];
  if (now) return [{ id: NOW_BADGE_ID, label: 'now', tone: 'success' }];
  return getCompletedChecks().has(checkId as CheckId) ? [{ id: NOW_BADGE_ID, label: 'not now', tone: 'neutral' }] : [];
};

const rotpBadgesOf = (location: string, item: string | null): readonly TrackerBadge[] => {
  const check = trackerCheckOf(location);
  if (check === undefined) return NO_BADGES;
  return [...swapBadge(check, item), ...presenceBadge(check.id)];
};

export { rotpBadgesOf };
