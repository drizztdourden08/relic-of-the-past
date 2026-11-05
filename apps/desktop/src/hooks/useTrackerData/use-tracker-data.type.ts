/* @layer renderer-lib @kind types */
import type { CheckId, CheckRecord, CheckStatus, GroupDimension, ItemId, RunContext } from '@rotp/game-data';
import type { Placement } from '@rotp/randomizer';
import type { TrackerReading } from '@drizztdourden08/brock-randomizer/tracker';
import type { ViewMode } from '../../compounds/ChecksTracker';
import type { runKindOfSession } from '../../game/randomizer-client';
import type { PlacementView, SessionStoreState } from '../../game/randomizer-client';

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

type RunKind = ReturnType<typeof runKindOfSession>;

interface TrackerStatusInputs {
  placement: Placement | null;
  reading: TrackerReading | null;
}

interface TrackerStatuses {
  checkRecords: CheckRecord[];
  effectiveCheckRecords: CheckRecord[];
  snapshot: ReadonlyMap<CheckId, CheckStatus>;
}

interface TrackerRunInputs {
  session: SessionStoreState;
  runKind: RunKind;
  checkRecords: readonly CheckRecord[];
  inventory: ReadonlySet<ItemId>;
  completed: ReadonlySet<CheckId>;
}

interface TrackerRun {
  placementView: PlacementView;
  run: RunContext;
}

export type {
  RunKind,
  TrackerDataOptions,
  TrackerRun,
  TrackerRunInputs,
  TrackerStats,
  TrackerStatusInputs,
  TrackerStatuses,
};
