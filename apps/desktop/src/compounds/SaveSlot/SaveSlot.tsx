/* @layer renderer-components @kind component */
import { Box, Text, Spinner } from '@drizztdourden08/tessera/primitives';
import './SaveSlot.css';
import { useArmedAction } from '../ArmedActionButton';
import { SlotActions } from './sub-components/SlotActions';
import { SlotScreenshot } from './sub-components/SlotScreenshot';
import { SlotTime } from './sub-components/SlotTime';
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
  const { armed, press, disarm } = useArmedAction({ resetKey });

  const cardClass = [
    'save-slot__card',
    highlighted ? 'save-slot__card--highlighted' : '',
  ].filter(Boolean).join(' ');

  return (
    <Box className={`save-slot ${busy ? 'save-slot--busy' : ''}`}>
      <Box className={cardClass}>
        <SlotScreenshot screenshotUrl={screenshotUrl} isEmpty={isEmpty} slotNumber={slotNumber} />
        {holdProgress != null && holdProgress > 0 && (
          <Box className="save-slot__fill" style={{ height: `${holdProgress * 100}%` }} />
        )}
        <Text className="save-slot__num">{slotNumber}</Text>
        {shortcutKey && <Text className="save-slot__key">{shortcutKey}</Text>}
        <SlotActions
          slot={slot}
          slotNumber={slotNumber}
          shortcutKey={shortcutKey}
          isEmpty={isEmpty}
          busy={busy}
          disableSave={disableSave}
          disableLoad={disableLoad}
          armed={armed}
          press={press}
          disarm={disarm}
          onSave={onSave}
          onLoad={onLoad}
        />
        {busy && (
          <Box className="save-slot__spinner">
            <Spinner />
          </Box>
        )}
      </Box>
      {!isEmpty && <SlotTime timestamp={timestamp} />}
    </Box>
  );
};

export {
  SaveSlot,
};
