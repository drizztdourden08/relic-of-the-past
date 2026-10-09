/* @layer renderer-widgets @kind types */
import type { CheckId, CheckRecord } from '@shared/game/data';
import type { CheckStatus } from '@shared/game/logic';
import type { FilterState, ItemFilter, StatusFilter } from '@shared/game/logic/queries/check-grouping';

interface StopAtCheckPickerProps {
  stopAtCheckId: CheckId | '';
  onStopAtChange: (id: CheckId | '') => void;
  disabled: boolean;
}

interface PanelPos {
  top: number;
  left: number;
  width: number;
}

interface StopAtCheckFiltersProps {
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
}

interface StopAtCheckListProps {
  checks: CheckRecord[];
  selectedId: CheckId | '';
  statuses: Map<string, CheckStatus>;
  onSelect: (id: CheckId | '') => void;
}

type ItemFilterOption = { value: ItemFilter; label: string };
type StatusFilterOption = { value: StatusFilter; label: string; title: string };

export type { ItemFilterOption, PanelPos, StatusFilterOption, StopAtCheckFiltersProps, StopAtCheckListProps, StopAtCheckPickerProps };
