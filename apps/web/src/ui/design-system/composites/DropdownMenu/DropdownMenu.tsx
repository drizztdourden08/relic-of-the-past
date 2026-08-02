/* @layer renderer-components @kind component */
import { useRef } from 'react';
import { Portal, useAnchorTracking } from '../../primitives/Portal';
import { Box } from '../../primitives/Box';
import { MenuItemButton } from './sub-components/MenuItemButton';
import { SubMenu } from './sub-components/SubMenu';
import type { CSSProperties } from 'react';
import type { DropdownMenuProps, MenuAlign, MenuSide } from './DropdownMenu.type';
import './DropdownMenu.css';

// Pinning the FAR edge is what lets a menu open upwards or leftwards without
// measuring its own height: `bottom` against the anchor's top does the same job
// as `top` against its bottom, and neither needs to know how tall the menu is.
const placementOf = (rect: DOMRect, side: MenuSide, align: MenuAlign): CSSProperties => ({
  position: 'fixed',
  ...(side === 'below' ? { top: rect.bottom } : { bottom: window.innerHeight - rect.top }),
  ...(align === 'start' ? { left: rect.left } : { right: window.innerWidth - rect.right }),
});

const DropdownMenu = (props: DropdownMenuProps) => {
  const { items, anchorRef, side = 'below', align = 'start' } = props;
  const detached = useRef<HTMLElement>(null);

  // Menus are portalled and placed in viewport coordinates, so the position
  // has to be re-measured while anything between the anchor and the root
  // scrolls; the menu owns no close handler, so it follows without dismissing.
  const { position: pos } = useAnchorTracking({
    active: Boolean(anchorRef),
    anchorRef: anchorRef ?? detached,
    compute: (rect) => placementOf(rect, side, align),
  });

  const menu = (
    <Box className="dropdown-menu" style={pos ?? undefined}>
      {items.map((item, i) => {
        if (item === 'separator') {
          return <Box key={`sep-${i}`} className="dropdown__separator" />;
        }
        if (item.children) {
          return <SubMenu key={item.key} item={item} />;
        }
        return <MenuItemButton key={item.key} item={item} />;
      })}
    </Box>
  );

  return <Portal layer="overlay">{menu}</Portal>;
};

export type { MenuItem, MenuEntry } from './DropdownMenu.type';

export { DropdownMenu };
