/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import { BindingRow } from './BindingRow';
import { assignmentLabel } from './assignment-label';
import { slotName } from '@rotp/input-mapping';
import type { SlotRowProps } from './controls.type';
import './SlotRow.css';

const SlotRow = ({ slot, assignment, onRebind, onRemove }: SlotRowProps) => {
  const handleRebind = useCallback(() => onRebind(slot), [onRebind, slot]);
  const handleRemove = useCallback(() => onRemove(slot.index), [onRemove, slot.index]);
  return (
    <Box className="slot-row">
      <BindingRow
        actionLabel={slotName(slot.index)}
        middleLabel={assignmentLabel(assignment)}
        binding={slot.binding}
        bindingIcon={slot.icon}
        onRebind={handleRebind}
      />
      <IconButton variant="ghost" tone="danger" size="sm" label={`Remove ${slotName(slot.index)}`} onClick={handleRemove}>
        <Icon name="trash-2" />
      </IconButton>
    </Box>
  );
};

export { SlotRow };
