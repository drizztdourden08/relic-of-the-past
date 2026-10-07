/* @layer renderer-components @kind component */
/**
 * One toolbar button: a symbol, an accessible name, and a tooltip that names it
 * in words the moment the pointer arrives. There is no text label, because a row
 * of eight labelled buttons is a row nobody can scan, and the tooltip says the
 * same thing without spending the width.
 *
 * The button swallows mousedown so focus never leaves the text being edited: an
 * insert is aimed at the caret, and a blur would lose it. Anything the button
 * opens is drawn outside that swallow and manages focus for itself.
 *
 * It holds no state. Only one card may be open at a time, so which button's card
 * is showing is the row's business. `open` arrives as a prop and a press is
 * reported upward with this button's own id.
 */
import { useCallback } from 'react';
import { Icon as SymbolIcon } from '@iconify/react/offline';
import { Box, IconButton, Tooltip } from '@ds/primitives';
import type { MouseEvent, ReactNode } from 'react';
import type { IconifyIcon } from '@iconify/types';
import './ToolbarButton.css';

type ToolbarButtonProps = {
  /** Reported back on press, so one handler serves the whole row. */
  id: string;
  icon: IconifyIcon;
  /** Plain-language name: the accessible name and the tooltip alike. */
  label: string;
  disabled?: boolean;
  /** True while this button's card is showing. */
  open?: boolean;
  /** The card this button opens, drawn under it while `open`. */
  popover?: ReactNode;
  onPress: (id: string) => void;
};

const ICON_PX = 14;

const ToolbarButton = (props: ToolbarButtonProps) => {
  const { id, icon, label, disabled = false, open = false, popover, onPress } = props;

  const handleClick = useCallback(() => onPress(id), [id, onPress]);

  const handleMouseDown = useCallback((event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
  }, []);

  return (
    <Box className="toolbar-button">
      <Tooltip content={label} placement="bottom">
        <IconButton
          variant="ghost"
          size="sm"
          active={open}
          label={label}
          disabled={disabled}
          aria-haspopup={popover ? 'dialog' : undefined}
          aria-expanded={popover ? open : undefined}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
        >
          <SymbolIcon icon={icon} width={ICON_PX} height={ICON_PX} />
        </IconButton>
      </Tooltip>

      {open ? popover : null}
    </Box>
  );
};

export { ToolbarButton };
export type { ToolbarButtonProps };
