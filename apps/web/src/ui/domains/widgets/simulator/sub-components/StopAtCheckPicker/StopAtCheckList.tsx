/* @layer renderer-widgets @kind component */
import { Box, Button, Text } from '@ds/primitives';
import { checkTypeIcon } from './behavior/check-type-icon';
import type { StopAtCheckListProps } from './StopAtCheckPicker.type';

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
        <Text className="stop-picker__row-name">No stop (full run)</Text>
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
          <Text className="stop-picker__row-name">{check.name}</Text>
          <Text className="stop-picker__row-id">{check.id}</Text>
        </Button>
      ))}
    </Box>
  );
};

export { StopAtCheckList };
