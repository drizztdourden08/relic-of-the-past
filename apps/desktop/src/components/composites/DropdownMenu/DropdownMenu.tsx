import { useRef, useLayoutEffect, useState, type RefObject } from 'react';
import { Portal } from '../../primitives/Portal';
import './DropdownMenu.css';

interface MenuItem {
  key: string;
  icon?: string;
  label: string;
  description?: string;
  disabled?: boolean;
  onClick?: () => void;
}

interface DropdownMenuProps {
  items: (MenuItem | 'separator')[];
  anchorRef?: RefObject<HTMLElement | null>;
}

export function DropdownMenu({ items, anchorRef }: DropdownMenuProps): JSX.Element {
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
        return (
          <button
            key={item.key}
            className="dropdown__item"
            onClick={item.onClick}
            disabled={item.disabled}
          >
            {item.icon && <span className="dropdown__icon">{item.icon}</span>}
            <span className="dropdown__label">
              {item.label}
              {item.description && (
                <span className="dropdown__desc">{item.description}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );

  return <Portal layer="overlay">{menu}</Portal>;
}
