/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box } from '../../../../../../design-system/primitives/Box';
import { Button } from '../../../../../../design-system/primitives/Button';
import { BindingRow } from './BindingRow';
import { assignmentLabel } from './assignment-label';
import { slotName } from '@shared/input/scheme';
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
      <Button
        variant="bare"
        className="slot-row__remove"
        title={`Remove ${slotName(slot.index)}`}
        onClick={handleRemove}
      >
        −
      </Button>
    </Box>
  );
};

export { SlotRow };
