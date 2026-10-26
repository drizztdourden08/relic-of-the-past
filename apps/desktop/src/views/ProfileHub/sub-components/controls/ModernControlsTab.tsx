/* @layer renderer-components @kind component */
import { Box, Button, Icon, Text } from '@drizztdourden08/tessera/primitives';
import { BindingListHeader } from './BindingListHeader';
import { CoreBindingsGroup } from './CoreBindingsGroup';
import { SlotRow } from './SlotRow';
import { AbsentAssignments } from './AbsentAssignments';
import { SchemeLayoutRow } from './SchemeLayoutRow';
import { EMPTY_HINT } from './controls.constants';
import type { CtrlProps } from './controls.type';
import './ModernControlsTab.css';

const ModernControlsTab = ({ ctrl }: CtrlProps) => {
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
            Add as many slots as your device has controls. What a slot fires is chosen in the pause menu.
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
          <Button variant="ghost" size="sm" icon={<Icon name="plus" />} onClick={ctrl.addModernSlot}>
            Add slot
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
