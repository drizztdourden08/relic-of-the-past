/* @layer renderer-lib @kind types */
import type { GroupDimension } from '@shared/game/logic/queries/check-grouping';
import type { ViewMode } from '../../ui/domains/app/compounds/ChecksTracker';

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

export type { TrackerDataOptions, TrackerStats };
