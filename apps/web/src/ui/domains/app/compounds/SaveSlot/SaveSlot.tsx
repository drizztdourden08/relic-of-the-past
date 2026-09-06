/* @layer renderer-components @kind data */
import { Box } from '../../../../design-system/primitives/Box';
import { Button } from '../../../../design-system/primitives/Button';
import { Text } from '../../../../design-system/primitives/Text';
import { Image } from '../../../../design-system/primitives/Image';
import { Icon } from '../../../../design-system/primitives/Icon';
import { Spinner } from '../../../../design-system/primitives/Spinner';
import './SaveSlot.css';
import { SAVE_ICON_PATHS, LOAD_ICON_PATHS } from './SaveSlot.constants';
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

  const cardClass = [
    'save-slot__card',
    highlighted ? 'save-slot__card--highlighted' : '',
  ].filter(Boolean).join(' ');

  return (
    <Box className={`save-slot ${busy ? 'save-slot--busy' : ''}`}>
      <Box className={cardClass}>
        {screenshotUrl ? (
          <Image src={screenshotUrl} alt={`Slot ${slot + 1}`} className="save-slot__img" />
        ) : (
          <Box className="save-slot__empty" />
        )}
        {/* Hold-to-save fill overlay */}
        {holdProgress != null && holdProgress > 0 && (
          <Box className="save-slot__fill" style={{ height: `${holdProgress * 100}%` }} />
        )}
        <Text className="save-slot__num">{slot + 1}</Text>
        {shortcutKey && <Text className="save-slot__key">{shortcutKey}</Text>}
        {/* Split action bar on the bottom half of the card, always visible over the shot */}
        <Box className="save-slot__actions">
          <Button
            variant="bare"
            className="save-slot__action save-slot__action--save"
            onClick={() => onSave(slot)}
            disabled={busy || disableSave}
            title={shortcutKey ? `Save (Shift+${shortcutKey})` : 'Save state'}
            aria-label={`Save slot ${slot + 1}`}
          >
            <Icon paths={SAVE_ICON_PATHS} size={16} />
          </Button>
          <Button
            variant="bare"
            className="save-slot__action save-slot__action--load"
            onClick={() => onLoad(slot)}
            disabled={isEmpty || busy || disableLoad}
            title={shortcutKey ? `Load (${shortcutKey})` : 'Load state'}
            aria-label={`Load slot ${slot + 1}`}
          >
            <Icon paths={LOAD_ICON_PATHS} size={16} />
          </Button>
        </Box>
        {/* Busy spinner gives feedback while saving/loading (screenshot capture + reload). */}
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
