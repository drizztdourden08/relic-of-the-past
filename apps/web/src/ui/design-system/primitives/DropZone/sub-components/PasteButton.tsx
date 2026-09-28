/* @layer renderer-components @kind component */
/**
 * The paste icon in a drop zone's top-right corner. Green when the clipboard holds something
 * the zone takes, disabled when it holds nothing it takes, plain while the browser has not
 * said. A click pastes into the zone and never opens the file picker.
 */
import type { MouseEvent } from 'react';
import { Icon } from '../../Icon';
import { ICON_VIEWBOX, OUTLINE, PASTE_ICON_PATHS, PASTE_ICON_SIZE } from '../DropZone.constants';
import type { ClipboardState } from '../behavior/useClipboardButton';

type PasteButtonProps = {
  state: ClipboardState;
  onPaste: () => void;
};

const TITLES: Record<ClipboardState, string> = {
  ready: 'Paste from the clipboard',
  empty: 'Nothing on the clipboard this can take',
  unknown: 'Paste from the clipboard',
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
      title={TITLES[state]}
      aria-label={TITLES[state]}
    >
      <Icon paths={PASTE_ICON_PATHS} viewBox={ICON_VIEWBOX} size={PASTE_ICON_SIZE} {...OUTLINE} aria-hidden="true" />
    </button>
  );
};

export { PasteButton };
export type { PasteButtonProps };
