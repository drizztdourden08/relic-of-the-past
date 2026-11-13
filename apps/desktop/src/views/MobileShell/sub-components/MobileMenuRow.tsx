/* @layer renderer-app @kind component */
import { Button, Icon, ICONS } from '@drizztdourden08/tessera/primitives';
import type { IconName } from '@drizztdourden08/tessera/primitives';
import type { MobileMenuRowProps } from '../MobileShell.type';

const iconOf = (icon: unknown): IconName | null =>
  typeof icon === 'string' && Object.hasOwn(ICONS, icon) ? (icon as IconName) : null;

const MobileMenuRow = (props: MobileMenuRowProps) => {
  const { item, onPress } = props;
  const icon = iconOf(item.icon);
  const opens = (item.children?.length ?? 0) > 0;
  return (
    <Button
      variant="ghost"
      fullWidth
      className="mobile-menu__item"
      disabled={item.disabled}
      active={item.checked}
      icon={icon ? <Icon name={icon} /> : undefined}
      iconEnd={opens ? <Icon name="chevron-right" /> : undefined}
      data-opens={opens || undefined}
      onClick={() => onPress(item)}
    >
      {item.label}
    </Button>
  );
};

export { MobileMenuRow };
