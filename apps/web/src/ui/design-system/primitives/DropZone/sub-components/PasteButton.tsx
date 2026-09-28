/* @layer renderer-components @kind component */
/**
 * The Paste button in a drop zone's top-right corner. Green when the clipboard holds
 * something the zone takes, disabled when it holds nothing it takes, plain before the
 * browser has said either. A click pastes into the zone and never opens the file picker.
 */
import type { MouseEvent } from 'react';
import { Icon } from '../../Icon';
import { ICON_VIEWBOX, OUTLINE, PASTE_ICON_PATHS, PASTE_ICON_SIZE } from '../DropZone.constants';
import type { ClipboardState } from '../behavior/useClipboardButton';

type PasteButtonProps = {
  state: ClipboardState;
  onPaste: () => void;
};

const PasteButton = (props: PasteButtonProps) => {
  const { state, onPaste } = props;
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onPaste();
  };
  return (
    <button
      type="button"
      className={`dropzone__paste${state === 'ready' ? ' dropzone__paste--ready' : ''}`}
      disabled={state === 'empty'}
      onClick={handleClick}
      title={state === 'empty' ? 'Nothing on the clipboard this can take' : 'Paste from the clipboard'}
    >
      <Icon paths={PASTE_ICON_PATHS} viewBox={ICON_VIEWBOX} size={PASTE_ICON_SIZE} {...OUTLINE} aria-hidden="true" />
      Paste
    </button>
  );
};

export { PasteButton };
export type { PasteButtonProps };
