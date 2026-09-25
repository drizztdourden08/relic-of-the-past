/* @layer renderer-components @kind component */
/**
 * SlotRow is one numbered slot under the modern scheme.
 *
 * The row is named for its NUMBER ("Slot 1", "Slot 2") because that is the
 * slot's whole identity (contract §19). What it is bound to is shown beside it
 * as a glyph, never as bare text: `getBindingIconUrl` ends its chain on a
 * generic picture keyed off the binding's own shape, so every bound control
 * draws something even with the pad unplugged and even for a control whose
 * family has no art. An UNBOUND slot draws no glyph, and that is the one case
 * where nothing is the honest answer, because there is no control to picture yet.
 *
 * Three cells and two buttons: the slot's number, what it currently fires, what
 * physically triggers it, and remove on the right. WHAT a slot fires is
 * chosen in the pause menu, on the item grid where the real sprites and names
 * live, so the assignment cell is display-only and the row's own click target
 * is the rebind, exactly like every other BindingRow on this screen.
 *
 * A SLOT WITH ITS BINDING CLEARED STILL EXISTS and still keeps its number. It
 * is not garbage: an empty numbered slot is how a player sees there is a free
 * button to fill, and the HUD draws it as an empty place. Only the remove
 * button takes one out of the list.
 */
import { Box } from '../../../../../../design-system/primitives/Box';
import { Button } from '../../../../../../design-system/primitives/Button';
import { BindingRow } from './BindingRow';
import { slotName } from '@shared/input/scheme';
import type { ModernSlot, SlotAssignment } from '@shared/types/controls';
import './SlotRow.css';

/** Neutral wording only: the item's own name belongs to the data layer and is
 *  shown by the pause menu, which reads it from the record dataset. */
const assignmentLabel = (assignment: SlotAssignment | undefined): string => {
  if (!assignment) return 'Unassigned';
  switch (assignment.kind) {
    case 'sword': return 'Sword';
    case 'action': return 'Action';
    case 'item': return 'Item';
    case 'none': return 'Unassigned';
  }
};

interface SlotRowProps {
  slot: ModernSlot;
  assignment?: SlotAssignment;
  onRebind: (slot: ModernSlot) => void;
  onRemove: (index: ModernSlot['index']) => void;
}

const SlotRow = ({ slot, assignment, onRebind, onRemove }: SlotRowProps) => {
  return (
    <Box className="slot-row">
      <BindingRow
        actionLabel={slotName(slot.index)}
        middleLabel={assignmentLabel(assignment)}
        binding={slot.binding}
        bindingIcon={slot.icon}
        onRebind={() => onRebind(slot)}
      />
      <Button
        variant="bare"
        className="slot-row__remove"
        title={`Remove ${slotName(slot.index)}`}
        onClick={() => onRemove(slot.index)}
      >
        −
      </Button>
    </Box>
  );
};

export { SlotRow, assignmentLabel };
