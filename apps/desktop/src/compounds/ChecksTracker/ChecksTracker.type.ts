/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { CheckRecord, ItemId, CheckStatus, FilterState, GroupDimension, GroupDimensionDef, GroupNode, RunContext } from '@rotp/game-data';

type ViewMode = 'compact' | 'detailed' | 'visual';

interface TrackerStats {
  completed: number;
  reachable: number;
  blocked: number;
  total: number;
}

interface TrackerPanels {
  filters: boolean;
  groupConfig: boolean;
  tags: boolean;
}

interface ChecksTrackerProps {
  stats: TrackerStats;
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  grouping: GroupDimension[];
  onGroupingChange: (dimensions: GroupDimension[]) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  groupTree: GroupNode;
  statuses: Map<string, CheckStatus>;
  eventStatus?: ReadonlyMap<string, boolean>;
  run?: RunContext;
  dimensions?: readonly GroupDimensionDef[];
  panels?: TrackerPanels;
  onPanelsChange?: (next: TrackerPanels) => void;
  expandedGroups?: readonly string[];
  onToggleGroup?: (key: string) => void;
  notice?: ReactNode;
  stickyHeader?: boolean;
  className?: string;
}

interface TrackerFiltersProps {
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  grouping: GroupDimension[];
  onGroupingChange: (dims: GroupDimension[]) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  dimensions?: readonly GroupDimensionDef[];
  panels?: TrackerPanels;
  onPanelsChange?: (next: TrackerPanels) => void;
  run?: RunContext;
}

interface TrackerFilterPanelsProps {
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  grouping: GroupDimension[];
  onGroupingChange: (dims: GroupDimension[]) => void;
  showTagFilter: boolean;
  showGroupConfig: boolean;
  dimensions?: readonly GroupDimensionDef[];
}

interface TrackerLogicTogglesProps {
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  run?: RunContext;
}

interface CheckCardProps {
  check: CheckRecord;
  status: CheckStatus;
  item?: ItemId;
  foreignItem?: string;
  now?: boolean;
}

interface CheckListProps {
  checks: readonly CheckRecord[];
  statuses: Map<string, CheckStatus>;
  eventStatus?: ReadonlyMap<string, boolean>;
  viewMode: ViewMode;
  run?: RunContext;
}

type StatusKey = CheckStatus | 'total';

interface CheckStatusIconProps {
  status: StatusKey;
  size?: number;
}

interface SwapBadgeProps {
  check: CheckRecord;
  shown?: ItemId;
}

interface TrackerCheckRowProps {
  check: CheckRecord;
  status: CheckStatus;
  detailed?: boolean;
  item?: ItemId;
  foreignItem?: string;
  now?: boolean;
}

interface TrackerGroupTreeProps {
  node: GroupNode;
  statuses: Map<string, CheckStatus>;
  eventStatus?: ReadonlyMap<string, boolean>;
  viewMode: ViewMode;
  run?: RunContext;
  expandedGroups?: readonly string[];
  onToggleGroup?: (key: string) => void;
}

interface CheckBatch {
  key: string;
  checks: readonly CheckRecord[];
}

interface TrackerSummaryProps {
  completed: number;
  reachable: number;
  blocked: number;
  total: number;
}

export type {
  CheckBatch, CheckCardProps, CheckListProps, CheckStatusIconProps, ChecksTrackerProps, StatusKey, SwapBadgeProps,
  TrackerCheckRowProps, TrackerFilterPanelsProps, TrackerFiltersProps, TrackerGroupTreeProps,
  TrackerLogicTogglesProps, TrackerPanels, TrackerStats, TrackerSummaryProps, ViewMode,
};
