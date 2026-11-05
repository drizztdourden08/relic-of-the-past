/* @layer tests @kind helper */
import { find } from '@rotp/game-data';
import { normalPlacement, trackerCheckRecords, trackerReachableScreens, trackerStatuses } from '@rotp/navigation';
import { mergeStatusOnlyChecks } from '@app/hooks/useTrackerData/merge-status-only-checks';
import type { CheckId } from '@rotp/game-data';
import type { LocationKey, Placement } from '@rotp/randomizer';
import type { TrackerStep } from './tracker-script.type';

const ALL_CHECKS = find('check', () => true);
const CHECK_IDS = ALL_CHECKS.map((check) => check.id).sort();
const STATUS_ONLY_IDS = ALL_CHECKS.filter((check) => check.statusOnly).map((check) => check.id).sort();

const pickCompleted = (step: TrackerStep): Set<CheckId> => {
  if (step.completedEvery === 0) return new Set();
  return new Set(CHECK_IDS.filter((_, index) => index % step.completedEvery === 0).slice(0, step.completedLimit));
};

const eventCount = (step: TrackerStep): number => {
  if (step.events === 'all') return STATUS_ONLY_IDS.length;
  return step.events === 'half' ? Math.floor(STATUS_ONLY_IDS.length / 2) : 0;
};

const pickEvents = (step: TrackerStep): Map<CheckId, boolean> =>
  new Map(STATUS_ONLY_IDS.slice(0, eventCount(step)).map((id): [CheckId, boolean] => [id, true]));

const pickFired = (step: TrackerStep, placement: Placement): Set<LocationKey> =>
  new Set((Object.keys(placement.locations).sort() as LocationKey[]).slice(0, step.fired));

const grouped = (statuses: ReadonlyMap<CheckId, string>): Record<string, string> => {
  const lists: Record<string, string[]> = {};
  for (const id of [...statuses.keys()].sort()) (lists[statuses.get(id) ?? 'none'] ??= []).push(id);
  return Object.fromEntries(Object.keys(lists).sort().map((status) => [status, (lists[status] ?? []).join(',')]));
};

const runTrackerTrace = (placement: Placement | null, steps: readonly TrackerStep[]) => {
  const logicPlacement = placement ?? normalPlacement();
  const checks = trackerCheckRecords(ALL_CHECKS, placement);
  return steps.map((step) => {
    const params = {
      placement: logicPlacement,
      checks,
      inventory: new Set(step.items),
      completed: mergeStatusOnlyChecks(pickCompleted(step), ALL_CHECKS, pickEvents(step)),
      fired: pickFired(step, logicPlacement),
      darkRoomsNeedLight: step.darkRoomsNeedLight,
      bigKeyDoors: step.bigKeyDoors,
      smallKeyDoors: step.smallKeyDoors,
    };
    return {
      step: step.name,
      statuses: grouped(trackerStatuses(params)),
      screens: [...trackerReachableScreens(params)].sort(),
    };
  });
};

export { runTrackerTrace };
