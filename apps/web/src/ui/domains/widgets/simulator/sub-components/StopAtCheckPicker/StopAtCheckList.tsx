/* @layer renderer-widgets @kind component */
/**
 * The scrollable, filtered list of checks in the stop-at-check picker. Each row
 * shows the check's type icon, name and id; a leading "No stop" row clears the
 * selection back to a full run.
 */
import { Box, Button, Text } from '@ds/primitives';
import type { CheckId, CheckRecord } from '@shared/game/data';
import type { CheckStatus } from '@shared/game/logic/eval';
import { checkTypeIcon } from './check-type-icons';

interface StopAtCheckListProps {
  checks: CheckRecord[];
  selectedId: CheckId | '';
  statuses: Map<string, CheckStatus>;
  onSelect: (id: CheckId | '') => void;
}

const StopAtCheckList = (props: StopAtCheckListProps) => {
  const { checks, selectedId, statuses, onSelect } = props;

  return (
    <Box className="stop-picker__list">
      <Button
        variant="bare"
        className={`stop-picker__row ${selectedId === '' ? 'stop-picker__row--selected' : ''}`}
        onClick={() => onSelect('')}
      >
        <Text className="stop-picker__row-icon">∞</Text>
        <Text className="stop-picker__row-name">No stop — full run</Text>
      </Button>

      {checks.length === 0 && (
        <Text className="stop-picker__empty">No checks match these filters.</Text>
      )}

      {checks.map((check) => (
        <Button
          variant="bare"
          key={check.id}
          className={`stop-picker__row stop-picker__row--${statuses.get(check.id) ?? 'blocked'} ${selectedId === check.id ? 'stop-picker__row--selected' : ''}`}
          onClick={() => onSelect(check.id)}
          title={check.kind}
        >
          <Text className="stop-picker__row-icon">{checkTypeIcon(check.kind)}</Text>
          <Text className="stop-picker__row-name">{check.randomizerName}</Text>
          <Text className="stop-picker__row-id">{check.id}</Text>
        </Button>
      ))}
    </Box>
  );
};

export { StopAtCheckList };
