/* @layer renderer-components @kind component */
/**
 * One acting row of a menu, the leaf. It is its own component because the
 * top-level menu and every submenu render exactly the same row, and a second
 * copy of it drifts: an icon added in one place and not the other is how a
 * submenu stops looking like the menu it belongs to.
 */
import { Button } from '../../../primitives/Button';
import { Text } from '../../../primitives/Text';
import type { MenuItem } from '../DropdownMenu.type';

interface MenuItemButtonProps {
  item: MenuItem;
}

const MenuItemButton = (props: MenuItemButtonProps) => {
  const { item } = props;

  return (
    <Button
      variant="bare"
      className="dropdown__item"
      onClick={item.onClick}
      disabled={item.disabled}
    >
      {item.icon && <Text className="dropdown__icon">{item.icon}</Text>}
      <Text className="dropdown__label">{item.label}</Text>
      {item.checked && <Text className="dropdown__check">✓</Text>}
    </Button>
  );
};

export { MenuItemButton };
export type { MenuItemButtonProps };
