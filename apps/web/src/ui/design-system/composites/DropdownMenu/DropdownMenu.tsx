/* @layer renderer-components @kind component */
import { useState, useLayoutEffect } from 'react';
import { Portal } from '../../primitives/Portal';
import { Box } from '../../primitives/Box';
import { Button } from '../../primitives/Button';
import { Text } from '../../primitives/Text';
import { SubMenu } from './sub-components/SubMenu';
import type { DropdownMenuProps } from './DropdownMenu.type';
import './DropdownMenu.css';

const DropdownMenu = (props: DropdownMenuProps) => {
  const { items, anchorRef } = props;
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!anchorRef?.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom, left: rect.left });
  }, [anchorRef]);

  const menu = (
    <Box
      className="dropdown-menu"
      style={pos ? { position: 'fixed', top: pos.top, left: pos.left } : undefined}
    >
      {items.map((item, i) => {
        if (item === 'separator') {
          return <Box key={`sep-${i}`} className="dropdown__separator" />;
        }
        if (item.children) {
          return <SubMenu key={item.key} item={item} />;
        }
        return (
          <Button
            variant="bare"
            key={item.key}
            className="dropdown__item"
            onClick={item.onClick}
            disabled={item.disabled}
          >
            {item.icon && <Text className="dropdown__icon">{item.icon}</Text>}
            <Text className="dropdown__label">{item.label}</Text>
            {item.checked && <Text className="dropdown__check">✓</Text>}
          </Button>
        );
      })}
    </Box>
  );

  return <Portal layer="overlay">{menu}</Portal>;
};

export type { MenuItem, MenuEntry } from './DropdownMenu.type';

export { DropdownMenu };
