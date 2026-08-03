/* @layer renderer-components @kind component */
/**
 * An entry that opens a panel of its own instead of acting.
 *
 * It RECURSES: a child carrying children of its own is another `SubMenu`, so a
 * menu fed a tree — a field tree, say — nests as deep as its data does. Without
 * that, a grandchild rendered as a leaf with nothing to click, which is a dead
 * row where a branch should be.
 *
 * Hover opens and leaving closes, matching every other submenu surface here.
 */
import { useRef, useState } from 'react';
import { Box } from '../../../primitives/Box';
import { Text } from '../../../primitives/Text';
import { SUB_MENU_PADDING, SUB_MENU_WIDTH, SUB_ROW_HEIGHT } from '../DropdownMenu.constants';
import { MenuItemButton } from './MenuItemButton';
import type { MenuItem } from '../DropdownMenu.type';

interface SubMenuProps {
  item: MenuItem;
}

interface PanelPosition {
  top: number;
  left: number;
}

/*
 * Opens to the right of its trigger, level with it — and flips to the left, or
 * rides up, only when that would put it off an edge. The height is estimated
 * from the row count because the panel does not exist yet to be measured.
 */
const panelPositionFor = (rect: DOMRect, rows: number): PanelPosition => ({
  top: Math.min(rect.top, window.innerHeight - (rows * SUB_ROW_HEIGHT + SUB_MENU_PADDING)),
  left: rect.right + SUB_MENU_WIDTH > window.innerWidth ? rect.left - SUB_MENU_WIDTH : rect.right,
});

const SubMenu = (props: SubMenuProps) => {
  const { item } = props;
  const ref = useRef<HTMLElement>(null);
  const [position, setPosition] = useState<PanelPosition | null>(null);
  const children = item.children ?? [];

  const handleEnter = (): void => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) setPosition(panelPositionFor(rect, children.length));
  };

  return (
    <Box
      ref={ref}
      className="dropdown__submenu-trigger"
      onMouseEnter={handleEnter}
      onMouseLeave={() => setPosition(null)}
    >
      <Box className="dropdown__item dropdown__item--parent">
        {item.icon && <Text className="dropdown__icon">{item.icon}</Text>}
        <Text className="dropdown__label">{item.label}</Text>
        <Text className="dropdown__chevron">›</Text>
      </Box>
      {position && (
        <Box
          className="dropdown-menu dropdown-menu--sub"
          style={{ position: 'fixed', top: position.top, left: position.left }}
        >
          {children.map((child) => (
            child.children
              ? <SubMenu key={child.key} item={child} />
              : <MenuItemButton key={child.key} item={child} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export { SubMenu };
export type { SubMenuProps };
