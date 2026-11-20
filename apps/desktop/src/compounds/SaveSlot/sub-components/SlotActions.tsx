/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { ArmedActionButton } from '../../ArmedActionButton';
import type { SlotActionsProps } from '../SaveSlot.type';

const SlotActions = (props: SlotActionsProps) => {
  const t = useT();
  const { slot, slotNumber, shortcutKey, isEmpty, busy, disableSave, disableLoad, armed, press, disarm, onSave, onLoad } = props;

  return (
    <Box className="save-slot__actions">
      <ArmedActionButton
        action="load"
        label={t('compounds:save-slot.load', { slotNumber })}
        shortcutHint={shortcutKey}
        disabled={isEmpty || busy || disableLoad}
        armed={armed === 'load'}
        onPress={() => press('load', () => onLoad(slot))}
        onDisarm={disarm}
      />
      <ArmedActionButton
        action="save"
        label={t('compounds:save-slot.save', { slotNumber })}
        shortcutHint={shortcutKey ? `Shift+${shortcutKey}` : undefined}
        disabled={busy || disableSave}
        armed={armed === 'save'}
        onPress={() => press('save', () => onSave(slot))}
        onDisarm={disarm}
      />
    </Box>
  );
};

export { SlotActions };
