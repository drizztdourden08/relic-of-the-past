/* @layer renderer-widgets @kind types */
import type { CheckId, CheckRecord } from '@shared/game/data';
import type { CheckStatus } from '@shared/game/logic';
import type { FilterState } from '@shared/game/logic/queries/check-grouping';

interface StopAtCheckPickerProps {
  stopAtCheckId: CheckId | '';
  onStopAtChange: (id: CheckId | '') => void;
  disabled: boolean;
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

export type { StopAtCheckFiltersProps, StopAtCheckListProps, StopAtCheckPickerProps };
