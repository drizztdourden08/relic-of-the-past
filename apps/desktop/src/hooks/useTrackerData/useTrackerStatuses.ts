/* @layer renderer-lib @kind hook */
import { useMemo } from 'react';
import { normalPlacement, trackerCheckRecords, trackerStatuses } from '@rotp/navigation';
import { find, smallKeyDoorsOf } from '@rotp/game-data';
import type { TrackerStatusInputs, TrackerStatuses } from './use-tracker-data.type';
import { mergeStatusOnlyChecks } from './merge-status-only-checks';

const useTrackerStatuses = (inputs: TrackerStatusInputs): TrackerStatuses => {
  const { placement, runKind, filter, inventory, completedChecks, eventStatus, fired } = inputs;

  const checkRecords = useMemo(() => find('check', () => true), []);
  const effectiveCheckRecords = useMemo(
    () => trackerCheckRecords(checkRecords, placement),
    [checkRecords, placement],
  );
  const bigKeyDoors = filter.bigKeyDoors ?? true;
  const smallKeyDoors = smallKeyDoorsOf(filter, { kind: runKind });
  const darkRoomsNeedLight = filter.darkRoomsNeedLight ?? true;

  const effectiveCompleted = useMemo(
    () => mergeStatusOnlyChecks(completedChecks, checkRecords, eventStatus),
    [completedChecks, checkRecords, eventStatus],
  );

  const logicPlacement = placement ?? normalPlacement();
  const snapshot = useMemo(
    () => trackerStatuses({
      placement: logicPlacement,
      checks: effectiveCheckRecords,
      inventory,
      completed: effectiveCompleted,
      fired,
      darkRoomsNeedLight,
      bigKeyDoors,
      smallKeyDoors,
    }),
    [logicPlacement, effectiveCheckRecords, inventory, effectiveCompleted, fired, darkRoomsNeedLight, bigKeyDoors, smallKeyDoors],
  );

  return { checkRecords, effectiveCheckRecords, effectiveCompleted, snapshot };
};

export { useTrackerStatuses };
