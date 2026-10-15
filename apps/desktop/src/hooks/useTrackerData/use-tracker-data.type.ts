/* @layer renderer-lib @kind types */
import type { CheckRecord, FilterState, GroupDimension, RunContext } from '@rotp/game-data';
import type { ViewMode } from '../../compounds/ChecksTracker';
import type { trackerCheckRecords, trackerStatuses } from '@rotp/navigation';
import type { runKindOfSession } from '../../game/randomizer-client';
import type { PlacementView } from '../../game/randomizer-client';
import type { useLiveTrackerInputs } from './useLiveTrackerInputs';
import type { mergeStatusOnlyChecks } from './merge-status-only-checks';

interface TrackerDataOptions {
  initialGrouping?: GroupDimension[];
  initialViewMode?: ViewMode;
  prefKey?: string;
}

interface TrackerStats {
  completed: number;
  reachable: number;
  blocked: number;
  total: number;
}

type LiveInputs = ReturnType<typeof useLiveTrackerInputs>;
type RunKind = ReturnType<typeof runKindOfSession>;
type TrackerPlacement = LiveInputs['sessionState']['placement'];

type TrackerStatusInputs = Pick<LiveInputs, 'inventory' | 'completedChecks' | 'eventStatus' | 'fired'> & {
  placement: TrackerPlacement;
  runKind: RunKind;
  filter: FilterState;
};

type TrackerStatuses = {
  checkRecords: CheckRecord[];
  effectiveCheckRecords: ReturnType<typeof trackerCheckRecords>;
  effectiveCompleted: ReturnType<typeof mergeStatusOnlyChecks>;
  snapshot: ReturnType<typeof trackerStatuses>;
};

type TrackerRunInputs = Pick<LiveInputs['sessionState'], 'foreignOwners'> & Pick<TrackerStatuses, 'checkRecords' | 'effectiveCompleted'> & {
  placement: TrackerPlacement;
  runKind: RunKind;
  inventory: LiveInputs['inventory'];
};

type TrackerRun = { placementView: PlacementView; run: RunContext };

export type {
  TrackerDataOptions,
  TrackerRun,
  TrackerRunInputs,
  TrackerStats,
  TrackerStatusInputs,
  TrackerStatuses,
};
