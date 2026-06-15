/* @layer renderer-components @kind component */
import { useRef, useState } from 'react';
import { Box } from '../../../primitives/Box';
import { Button } from '../../../primitives/Button';
import { Text } from '../../../primitives/Text';
import type { MenuItem } from '../DropdownMenu.type';

interface SubMenuProps {
  item: MenuItem;
}

const SubMenu = (props: SubMenuProps) => {
  const { item } = props;
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [subPos, setSubPos] = useState<{ top: number; left: number } | null>(null);

  const handleEnter = () => {
    setOpen(true);
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const subWidth = 180;
      const left = rect.right + subWidth > window.innerWidth
        ? rect.left - subWidth
        : rect.right;
      const top = Math.min(rect.top, window.innerHeight - (item.children!.length * 30 + 8));
      setSubPos({ top, left });
    }
  };

  return (
    <Box
      ref={ref}
      className="dropdown__submenu-trigger"
      onMouseEnter={handleEnter}
      onMouseLeave={() => setOpen(false)}
    >
      <Box className="dropdown__item dropdown__item--parent">
        {item.icon && <Text className="dropdown__icon">{item.icon}</Text>}
        <Text className="dropdown__label">{item.label}</Text>
        <Text className="dropdown__chevron">›</Text>
      </Box>
      {open && subPos && (
        <Box
          className="dropdown-menu dropdown-menu--sub"
          style={{ position: 'fixed', top: subPos.top, left: subPos.left }}
        >
          {item.children!.map((child, i) => {
            if (child === ('separator' as unknown)) {
              return <Box key={`sep-${i}`} className="dropdown__separator" />;
            }
            return (
              <Button
                variant="bare"
                key={child.key}
                className="dropdown__item"
                onClick={child.onClick}
                disabled={child.disabled}
              >
                {child.icon && <Text className="dropdown__icon">{child.icon}</Text>}
                <Text className="dropdown__label">{child.label}</Text>
                {child.checked && <Text className="dropdown__check">✓</Text>}
              </Button>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export { SubMenu };
export type { SubMenuProps };
