/* @layer renderer-widgets @kind types */
import type { CheckId, CheckRecord, CheckStatus, FilterState } from '@rotp/game-data';

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
