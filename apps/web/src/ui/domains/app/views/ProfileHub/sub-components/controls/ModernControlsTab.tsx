/* @layer renderer-components @kind component */
/**
 * ModernControlsTab is the player's own slot list, plus the core verbs.
 *
 * THE LIST IS BUILT HERE, not derived. "Add slot" appends an empty numbered
 * slot; the minus on a row removes one and closes the gap, renumbering what is
 * below it. There is no cap and no category filter (contract §19), so someone
 * with a thirty-button device can add thirty rows and a keyboard player can add
 * as many keys as they like. The old face-and-d-pad-only derivation made that
 * impossible.
 *
 * THE HUD LAYOUT IS HERE TOO, at the foot of the list. It belongs to the
 * scheme, not to a global HUD setting, so switching control profile switches
 * the arrangement along with the slots and what they fire.
 *
 * An empty slot is a row, on purpose. It has a number, it draws in the HUD, and
 * it is the answer to "where could I put this?".
 */
import { Box } from '../../../../../../design-system/primitives/Box';
import { Button } from '../../../../../../design-system/primitives/Button';
import { Text } from '../../../../../../design-system/primitives/Text';
import { BindingListHeader } from './BindingListHeader';
import { CoreBindingsGroup } from './CoreBindingsGroup';
import { SlotRow } from './SlotRow';
import { AbsentAssignments } from './AbsentAssignments';
import { SchemeLayoutRow } from './SchemeLayoutRow';
import type { useControlsSettings } from '../useControlsSettings';
import './ModernControlsTab.css';

type Ctrl = ReturnType<typeof useControlsSettings>;

const EMPTY_HINT = 'Assign a controller to this profile to see its slots. Drop one from the Devices column.';

const ModernControlsTab = ({ ctrl }: { ctrl: Ctrl }) => {
  return (
    <Box
      className={`controls-settings__bindings ${ctrl.dragOverBindings ? 'controls-settings__bindings--drag-over' : ''}`}
      onDragOver={ctrl.handleDragOver}
      onDragLeave={ctrl.handleDragLeave}
      onDrop={ctrl.handleDrop}
    >
      <Box className="controls-settings__section-header">Core Verbs</Box>
      <Box className="controls-settings__binding-list">
        <CoreBindingsGroup core={ctrl.coreBindings} icons={ctrl.coreIcons} onRebind={ctrl.handleCoreRebind} />

        <Box className="modern-tab__slots-head">
          <Text className="modern-tab__slots-title">Slots</Text>
          <Text variant="caption" className="modern-tab__slots-hint">
            Slots are numbered, and the list is yours: add as many as your device has controls, and
            remove the ones you do not want. What a slot fires is chosen in the pause menu; this list
            says where each one sits and lets you re-bind the control itself.
          </Text>
        </Box>
        <BindingListHeader actionLabel="Slot" middleLabel="Assignment" />
        {ctrl.modernSlots.map((slot) => (
          <SlotRow
            key={slot.index}
            slot={slot}
            assignment={ctrl.assignments[slot.index]}
            onRebind={ctrl.handleSlotRebind}
            onRemove={ctrl.removeModernSlot}
          />
        ))}
        {ctrl.modernSlots.length === 0 && (
          <Text as="p" className="modern-tab__empty">
            {ctrl.hasSlotSource ? 'No slots yet. Add one below.' : EMPTY_HINT}
          </Text>
        )}
        <Box className="modern-tab__add">
          <Button variant="bare" className="modern-tab__add-button" onClick={ctrl.addModernSlot}>
            + Add slot
          </Button>
        </Box>

        <AbsentAssignments entries={ctrl.absentAssignments} />

        <SchemeLayoutRow
          value={ctrl.layoutId}
          layouts={ctrl.layouts}
          disabled={!ctrl.hasSlotSource}
          onChange={ctrl.setLayoutId}
        />
      </Box>
    </Box>
  );
};

export { ModernControlsTab };
