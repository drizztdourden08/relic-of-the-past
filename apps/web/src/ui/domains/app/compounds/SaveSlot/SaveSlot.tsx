/* @layer renderer-components @kind data */
import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
import { Image } from '../../../../design-system/primitives/Image';
import { Spinner } from '../../../../design-system/primitives/Spinner';
import './SaveSlot.css';
import { LOAD_GLYPH, SAVE_GLYPH, ARM_TIMEOUT_MS } from './SaveSlot.constants';
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
        {screenshotUrl ? (
          <Image src={screenshotUrl} alt={`Slot ${slotNumber}`} className="save-slot__img" />
        ) : (
          <Box className="save-slot__empty" />
        )}
        {/* Hold-to-save fill overlay */}
        {holdProgress != null && holdProgress > 0 && (
          <Box className="save-slot__fill" style={{ height: `${holdProgress * 100}%` }} />
        )}
        <Text className="save-slot__num">{slotNumber}</Text>
        {shortcutKey && <Text className="save-slot__key">{shortcutKey}</Text>}
        {/* Split action bar, bottom slice of the card, always visible over the shot.
            Load sits on the left and Save on the right, in DOM order too, so the
            tab sequence matches what is drawn. Each takes one click to arm and a
            second click to confirm. */}
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
        {/* Busy spinner: feedback while saving/loading (screenshot capture + reload). */}
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
