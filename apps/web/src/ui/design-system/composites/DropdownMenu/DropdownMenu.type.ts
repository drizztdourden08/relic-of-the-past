/* @layer renderer-components @kind types */
import type { RefObject } from 'react';

interface MenuItem {
  key: string;
  icon?: string;
  label: string;
  description?: string;
  disabled?: boolean;
  /** When true, renders a trailing checkmark (e.g. an enabled widget). */
  checked?: boolean;
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
}

export type { DropdownMenuProps, MenuAlign, MenuEntry, MenuItem, MenuSide };
