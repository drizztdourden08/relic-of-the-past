/* @layer renderer-lib @kind hook */
import { useMemo } from 'react';
import { liveChestItems } from '@rotp/game-data';
import type { RunContext } from '@rotp/game-data';
import { buildPlacementView } from '../../game/randomizer-client';
import type { PlacementView } from '../../game/randomizer-client';
import type { TrackerRun, TrackerRunInputs } from './use-tracker-data.type';

const useTrackerRun = (inputs: TrackerRunInputs): TrackerRun => {
  const { placement, foreignOwners, runKind, checkRecords, inventory, effectiveCompleted } = inputs;

  const placementView: PlacementView = useMemo(
    () => buildPlacementView(placement, foreignOwners), [placement, foreignOwners],
  );
  const liveItems = useMemo(
    () => (runKind === 'normal' ? liveChestItems(checkRecords, inventory, effectiveCompleted) : undefined),
    [runKind, checkRecords, inventory, effectiveCompleted],
  );
  const run: RunContext = useMemo(
    () => (placement
      ? {
        kind: runKind, placedItems: placementView.itemByCheck,
        foreignItems: placementView.foreignByCheck, spheres: placementView.sphereByCheck,
      }
      : { kind: runKind, liveItems }),
    [placement, runKind, placementView, liveItems],
  );

  return { placementView, run };
};

export { useTrackerRun };
