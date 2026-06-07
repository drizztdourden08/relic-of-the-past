/* @layer renderer-components @kind component */
import { useState, useLayoutEffect } from 'react';
import { Portal } from '../../primitives/Portal';
import { SubMenu } from './sub-components/SubMenu';
import type { DropdownMenuProps } from './types';
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
    <div
      className="dropdown-menu"
      style={pos ? { position: 'fixed', top: pos.top, left: pos.left } : undefined}
    >
      {items.map((item, i) => {
        if (item === 'separator') {
          return <div key={`sep-${i}`} className="dropdown__separator" />;
        }
        if (item.children) {
          return <SubMenu key={item.key} item={item} />;
        }
        return (
          <button
            key={item.key}
            className="dropdown__item"
            onClick={item.onClick}
            disabled={item.disabled}
          >
            {item.icon && <span className="dropdown__icon">{item.icon}</span>}
            <span className="dropdown__label">{item.label}</span>
          </button>
        );
      })}
    </div>
  );

  return <Portal layer="overlay">{menu}</Portal>;
};

export type { MenuItem, MenuEntry } from './types';

export { DropdownMenu };
