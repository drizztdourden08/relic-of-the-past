/* @layer renderer-components @kind component */
import { useRef } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { DropdownMenu } from '@ds/composites/DropdownMenu';
import type { ToolbarMenuProps } from './ToolbarMenu.type';

const ToolbarMenu = (props: ToolbarMenuProps) => {
  const { icon, label, items, panel, open, disabled = false, onToggle, onClose } = props;
  const anchor = useRef<HTMLDivElement>(null);
  const empty = !panel && (items?.length ?? 0) === 0;

  return (
    <Box ref={anchor} className="hud-toolbar__group">
      <Button
        variant="bare"
        className={`hud-toolbar__button${open ? ' is-open' : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Insert ${label}`}
        title={`Insert ${label}`}
        disabled={disabled || empty}
        onClick={onToggle}
      >
        <IconifyIcon className="hud-toolbar__icon" icon={icon} width={16} height={16} aria-hidden />
      </Button>
      {open && (panel
        ? panel(anchor)
        : (
          <Box className="hud-toolbar__menu" onClick={onClose}>
            <DropdownMenu items={items ?? []} anchorRef={anchor} />
          </Box>
        ))}
    </Box>
  );
};

export { ToolbarMenu };
export type { ToolbarMenuProps } from './ToolbarMenu.type';
