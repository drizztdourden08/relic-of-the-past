/* @layer renderer-app @kind logic */
import { find } from '@rotp/game-data';
import type { CheckRecord } from '@rotp/game-data';
import {
  getCompletedChecks, getCurrentInventory, getEventStatus, onCompletedChecksChanged, onEventStatusChanged,
  onInventoryChanged,
} from '@app/game/tracker';
import { firedLocations, onFiredLocation } from '@app/game/randomizer-client';
import { mergeStatusOnlyChecks } from '@app/hooks/useTrackerData/merge-status-only-checks';

let records: readonly CheckRecord[] | null = null;

const rotpCompleted = (): ReadonlySet<string> => {
  records ??= find('check', () => true);
  return new Set<string>([
    ...mergeStatusOnlyChecks(getCompletedChecks(), records, getEventStatus()),
    ...firedLocations(),
  ]);
};

const rotpHeld = (): readonly string[] => [...getCurrentInventory()];

const rotpSubscribe = (fn: () => void): (() => void) => {
  const stops = [
    onInventoryChanged(fn), onCompletedChecksChanged(fn), onEventStatusChanged(fn), onFiredLocation(fn),
  ];
  return () => stops.forEach((stop) => stop());
};

export { rotpCompleted, rotpHeld, rotpSubscribe };
