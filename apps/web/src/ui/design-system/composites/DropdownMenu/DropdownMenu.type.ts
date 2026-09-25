/* @layer renderer-components @kind types */
import type { IconifyIcon } from '@iconify/types';
import type { RefObject } from 'react';

/** A Lucide icon (the convention) or a raw character, for the handful of rows
 *  whose icon is DATA instead of a design choice. */
type MenuIconSource = IconifyIcon | string;

interface MenuItem {
  key: string;
  icon?: MenuIconSource;
  label: string;
  description?: string;
  disabled?: boolean;
  /** When true, renders a trailing checkmark (e.g. an enabled widget). */
  checked?: boolean;
  /** The keystroke that does the same thing, printed right-aligned (e.g.
   *  "Ctrl ↑"). A menu is where a shortcut is learned; an item that performs an
   *  operation a key also performs and does not say so teaches the mouse route
   *  and hides the fast one. Caller-formatted, because only the caller knows
   *  which modifier this platform actually means. */
  shortcut?: string;
  onClick?: () => void;
  children?: MenuItem[];
}

type MenuEntry = MenuItem | 'separator';

/** Which side of the anchor the menu hangs off. */
type MenuSide = 'below' | 'above';

/** Which of the anchor's edges the menu lines its own up with. */
type MenuAlign = 'start' | 'end';

interface DropdownMenuProps {
  items: MenuEntry[];
  anchorRef?: RefObject<HTMLElement | null>;
  /**
   * Defaults to below/start, which is right for a trigger near the top of the
   * screen. A trigger sitting at the bottom or the right edge would push the
   * menu off-screen, so it can pin the opposite edge instead.
   */
  side?: MenuSide;
  align?: MenuAlign;
  /**
   * Supply this and the menu takes part in `Escape` handling at the `menu`
   * level, so one press closes it and nothing underneath. Omit it and the menu
   * stays inert, which is what a caller that already owns "one open at a time"
   * (and registers at `menu` itself) wants.
   */
  onClose?: () => void;
}

export type { DropdownMenuProps, MenuAlign, MenuEntry, MenuIconSource, MenuItem, MenuSide };
