/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { CheckStatus } from '@shared/game/logic/eval';
import type {
  FilterState, GroupDimension, GroupDimensionDef, GroupNode, RunContext,
} from '@shared/game/logic/queries/check-grouping';
import type { ViewMode } from './sub-components/TrackerFilters';

interface TrackerStats {
  completed: number;
  reachable: number;
  blocked: number;
  total: number;
}

interface ChecksTrackerProps {
  /** Whole-dataset counts, shown in the summary bar. */
  stats: TrackerStats;
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  grouping: GroupDimension[];
  onGroupingChange: (dimensions: GroupDimension[]) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  groupTree: GroupNode;
  statuses: Map<string, CheckStatus>;
  /** Randomized run: what each check actually holds, and its sweep sphere. */
  run?: RunContext;
  /** Grouping axes the config panel offers. Defaults to the base catalog. */
  dimensions?: readonly GroupDimensionDef[];
  /** Rendered between the filters and the tree — a caveat, a count, a warning. */
  notice?: ReactNode;
  className?: string;
}

export type { ChecksTrackerProps, TrackerStats };
