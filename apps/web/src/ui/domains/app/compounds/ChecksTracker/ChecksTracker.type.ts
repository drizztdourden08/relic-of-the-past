/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { CheckRecord, ItemId } from '@shared/game/data';
import type { CheckStatus } from '@shared/game/logic';
import type {
  FilterState, GroupDimension, GroupDimensionDef, GroupNode, RunContext,
} from '@shared/game/logic/queries/check-grouping';

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
  checks: CheckRecord[];
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

interface TrackerSummaryProps {
  completed: number;
  reachable: number;
  blocked: number;
  total: number;
}

export type {
  CheckCardProps, CheckListProps, CheckStatusIconProps, ChecksTrackerProps, StatusKey, SwapBadgeProps,
  TrackerCheckRowProps, TrackerFilterPanelsProps, TrackerFiltersProps, TrackerGroupTreeProps,
  TrackerLogicTogglesProps, TrackerPanels, TrackerStats, TrackerSummaryProps, ViewMode,
};
