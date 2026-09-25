/* @layer renderer-components @kind component */
/**
 * One small icon toolbar button and whatever it drops, which is a plain list
 * (`DropdownMenu`) or a custom panel such as a picker grid.
 *
 * Icon-only, tooltip on hover: the label lives in `title` instead of beside
 * the icon, which is what lets a dozen of these sit in one row. Only one
 * menu in the bar is open at a time, which is why open/close is the
 * PARENT's state, not this component's. Two open panels overlapping
 * is the thing that idiom never does.
 */
import { useRef } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { DropdownMenu } from '@ds/composites/DropdownMenu';
import type { ReactNode, RefObject } from 'react';
import type { IconifyIcon as IconifyIconData } from '@iconify/types';
import type { MenuEntry } from '@ds/composites/DropdownMenu';

interface ToolbarMenuProps {
  /** Lucide, through `@iconify/react`, which is the project's convention (§50). */
  icon: IconifyIconData;
  label: string;
  items?: MenuEntry[];
  /** A custom panel instead of a plain list. It owns its own dismissal. */
  panel?: (anchorRef: RefObject<HTMLElement | null>) => ReactNode;
  open: boolean;
  disabled?: boolean;
  onToggle: () => void;
  onClose: () => void;
}

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
export type { ToolbarMenuProps };
