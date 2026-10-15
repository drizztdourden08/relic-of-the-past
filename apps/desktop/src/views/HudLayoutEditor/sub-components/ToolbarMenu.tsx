/* @layer renderer-components @kind component */
import { useRef } from 'react';
import { Box, Icon, Pressable } from '@drizztdourden08/tessera/primitives';
import { DropdownMenu } from '@drizztdourden08/tessera/composites';
import type { ToolbarMenuProps } from './ToolbarMenu.type';

const ToolbarMenu = (props: ToolbarMenuProps) => {
  const { icon, label, items, panel, open, disabled = false, onToggle, onClose } = props;
  const anchor = useRef<HTMLDivElement>(null);
  const empty = !panel && (items?.length ?? 0) === 0;

  return (
    <Box ref={anchor} className="hud-toolbar__group">
      <Pressable
        className={`hud-toolbar__button${open ? ' is-open' : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Insert ${label}`}
        title={`Insert ${label}`}
        disabled={disabled || empty}
        onClick={onToggle}
      >
        <Icon className="hud-toolbar__icon" icon={icon} size={16} aria-hidden />
      </Pressable>
      {open && (panel
        ? panel(anchor)
        : (
          <Box className="hud-toolbar__menu" onClick={onClose}>
            <DropdownMenu groups={[{ id: label, items: items ?? [] }]} label={label} anchorRef={anchor} onClose={onClose} />
          </Box>
        ))}
    </Box>
  );
};

export { ToolbarMenu };
