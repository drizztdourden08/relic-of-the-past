/* @layer renderer-components @kind component */
import { Box, Text, Image, Icon, Spinner } from '@drizztdourden08/tessera/primitives';
import './SaveSlot.css';
import {
  LOAD_GLYPH, SAVE_GLYPH, ARM_TIMEOUT_MS,
  NO_SCREENSHOT_FRAME_PATHS, NO_SCREENSHOT_FRAME_CIRCLES,
  NO_SCREENSHOT_CANCEL_PATHS, NO_SCREENSHOT_CANCEL_CIRCLES,
} from './SaveSlot.constants';
import { useArmedAction } from './behavior/useArmedAction';
import { SlotActionButton } from './sub-components/SlotActionButton';
import { type SaveSlotProps } from './SaveSlot.type';

const SaveSlot = (props: SaveSlotProps) => {
  const {
    slot,
    screenshotUrl,
    timestamp,
    isEmpty,
    busy,
    shortcutKey,
    disableSave,
    disableLoad,
    highlighted,
    holdProgress,
    onSave,
    onLoad,
  } = props;

  const slotNumber = slot + 1;
  const resetKey = `${screenshotUrl ?? ''}|${timestamp}|${isEmpty}|${busy}`;
  const { armed, press, disarm } = useArmedAction({ timeoutMs: ARM_TIMEOUT_MS, resetKey });

  const cardClass = [
    'save-slot__card',
    highlighted ? 'save-slot__card--highlighted' : '',
  ].filter(Boolean).join(' ');

  return (
    <Box className={`save-slot ${busy ? 'save-slot--busy' : ''}`}>
      <Box className={cardClass}>
        {screenshotUrl && (
          <Image src={screenshotUrl} alt={`Slot ${slotNumber}`} className="save-slot__img" />
        )}
        {!screenshotUrl && !isEmpty && (
          <Box className="save-slot__empty">
            <Box className="save-slot__empty-badge">
              <Icon
                className="save-slot__badge-frame"
                paths={NO_SCREENSHOT_FRAME_PATHS}
                circles={NO_SCREENSHOT_FRAME_CIRCLES}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.1}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Icon
                className="save-slot__badge-cancel"
                paths={NO_SCREENSHOT_CANCEL_PATHS}
                circles={NO_SCREENSHOT_CANCEL_CIRCLES}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Box>
            <Image src="./logos/sentri/sentri-trimmed.png" alt="" className="save-slot__empty-mascot" />
          </Box>
        )}
        {holdProgress != null && holdProgress > 0 && (
          <Box className="save-slot__fill" style={{ height: `${holdProgress * 100}%` }} />
        )}
        <Text className="save-slot__num">{slotNumber}</Text>
        {shortcutKey && <Text className="save-slot__key">{shortcutKey}</Text>}
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
        {busy && (
          <Box className="save-slot__spinner">
            <Spinner />
          </Box>
        )}
      </Box>
      {!isEmpty && (
        <Text className="save-slot__time">
          {new Date(timestamp).toLocaleString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </Text>
      )}
    </Box>
  );
};

export {
  SaveSlot,
};
