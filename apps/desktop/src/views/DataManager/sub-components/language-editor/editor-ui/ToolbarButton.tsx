/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Icon as SymbolIcon } from '@iconify/react/offline';
import { Box, IconButton, Tooltip } from '@drizztdourden08/tessera/primitives';
import type { MouseEvent } from 'react';
import { ICON_PX } from './ToolbarButton.constants';
import type { ToolbarButtonProps } from './ToolbarButton.type';
import './ToolbarButton.css';

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
