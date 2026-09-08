/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { CheckStatus } from '@shared/game/logic/eval';
import type {
  FilterState, GroupDimension, GroupDimensionDef, GroupNode, RunContext,
} from '@shared/game/logic/queries/check-grouping';

/** How a check leaf is drawn: a bare row, a row with its item, or an item card. */
type ViewMode = 'compact' | 'detailed' | 'visual';

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
  /** Rendered between the filters and the tree: a caveat, a count, a warning. */
  notice?: ReactNode;
  /**
   * Pins the summary and filters, leaving the check list as the only thing that
   * scrolls. Off, the whole tracker scrolls as one and the header goes with it,
   * which is what a short widget wants when the list is the point.
   */
  stickyHeader?: boolean;
  className?: string;
}

export type { ChecksTrackerProps, TrackerStats, ViewMode };
