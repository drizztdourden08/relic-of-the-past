/* @layer renderer-components @kind component */
/**
 * A menu row's icon, either way it can be given.
 *
 * TWO SHAPES, ONE SLOT. A row's icon is normally a Lucide icon through
 * `@iconify/react` (one stroke weight, one family, the project's convention),
 * but some rows carry an icon that is DATA instead of a design choice (a HUD
 * preset's own character, for one), and those stay strings. Rendering both here
 * is what stops the leaf row and the submenu row from disagreeing about which
 * kinds exist, the same reason `MenuItemButton` is one component.
 */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Text } from '../../../primitives/Text';
import type { MenuIconSource } from '../DropdownMenu.type';

interface MenuIconProps {
  icon: MenuIconSource;
}

const MenuIcon = (props: MenuIconProps) => {
  const { icon } = props;
  return typeof icon === 'string'
    ? <Text className="dropdown__icon">{icon}</Text>
    : <IconifyIcon className="dropdown__icon" icon={icon} width={16} height={16} aria-hidden />;
};

export { MenuIcon };
export type { MenuIconProps };
