/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { LOAD_GLYPH, SAVE_GLYPH } from '../SaveSlot.constants';
import type { SlotActionsProps } from '../SaveSlot.type';
import { SlotActionButton } from './SlotActionButton';

const SlotActions = (props: SlotActionsProps) => {
  const { slot, slotNumber, shortcutKey, isEmpty, busy, disableSave, disableLoad, armed, press, disarm, onSave, onLoad } = props;

  return (
    <Box className="save-slot__actions">
      <SlotActionButton
        action="load"
        glyph={LOAD_GLYPH}
        label={`Load slot ${slotNumber}`}
        shortcutHint={shortcutKey}
        disabled={isEmpty || busy || disableLoad}
        armed={armed === 'load'}
        onPress={() => press('load', () => onLoad(slot))}
        onDisarm={disarm}
      />
      <SlotActionButton
        action="save"
        glyph={SAVE_GLYPH}
        label={`Save to slot ${slotNumber}`}
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
