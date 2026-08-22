/* @layer renderer-components @kind component */
/**
 * The strip along the bottom of the editor card: a small left cluster for
 * undoing, a right cluster for committing.
 *
 * Both actions are OPTIONAL and belong to whoever composes this editor. Nothing
 * is invented here — an absent callback means the button is simply not drawn,
 * which is why an editor embedded in a card that saves on its own shows no save
 * button at all. Rendering nothing when neither is supplied keeps the card from
 * ending in an empty bar.
 */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import eraserIcon from '@iconify-icons/lucide/eraser';
import checkIcon from '@iconify-icons/lucide/check';
import { Box, IconButton } from '@ds/primitives';
import './EditorBottomBar.css';

type EditorBottomBarProps = {
  /** Empties the line. Absent = no clear button. */
  onClear?: () => void;
  /** Commits the line. Absent = no save button. */
  onSave?: () => void;
  disabled?: boolean;
};

const ICON_PX = 14;
const CLEAR_LABEL = 'Clear this line';
const SAVE_LABEL = 'Save this line';

const EditorBottomBar = (props: EditorBottomBarProps) => {
  const { onClear, onSave, disabled = false } = props;

  if (!onClear && !onSave) return null;

  return (
    <Box className="editor-bottom-bar">
      <Box className="editor-bottom-bar__cluster">
        {onClear ? (
          <IconButton variant="ghost" size="sm" label={CLEAR_LABEL} disabled={disabled} onClick={onClear}>
            <IconifyIcon icon={eraserIcon} width={ICON_PX} height={ICON_PX} />
          </IconButton>
        ) : null}
      </Box>
      <Box className="editor-bottom-bar__cluster">
        {onSave ? (
          <IconButton variant="primary" size="sm" label={SAVE_LABEL} disabled={disabled} onClick={onSave}>
            <IconifyIcon icon={checkIcon} width={ICON_PX} height={ICON_PX} />
          </IconButton>
        ) : null}
      </Box>
    </Box>
  );
};

export { EditorBottomBar };
export type { EditorBottomBarProps };
