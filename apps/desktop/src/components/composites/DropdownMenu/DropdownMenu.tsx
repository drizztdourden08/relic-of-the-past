import type { ReactNode } from 'react';
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
}

export function DropdownMenu({ items }: DropdownMenuProps): JSX.Element {
  return (
    <div className="dropdown-menu">
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
}
