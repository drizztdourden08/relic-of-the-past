import { useRef, useLayoutEffect, useState, type RefObject } from 'react';
import { Portal } from '../../primitives/Portal';
import './DropdownMenu.css';

interface MenuItem {
  key: string;
  icon?: string;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
  children?: MenuItem[];
}

type MenuEntry = MenuItem | 'separator';

interface DropdownMenuProps {
  items: MenuEntry[];
  anchorRef?: RefObject<HTMLElement | null>;
}

function SubMenu({ item }: { item: MenuItem }): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [subPos, setSubPos] = useState<{ top: number; left: number } | null>(null);

  const handleEnter = () => {
    setOpen(true);
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const subWidth = 180;
      // Prefer right side, fall back to left if it overflows
      const left = rect.right + subWidth > window.innerWidth
        ? rect.left - subWidth
        : rect.right;
      const top = Math.min(rect.top, window.innerHeight - (item.children!.length * 30 + 8));
      setSubPos({ top, left });
    }
  };

  return (
    <div
      ref={ref}
      className="dropdown__submenu-trigger"
      onMouseEnter={handleEnter}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="dropdown__item dropdown__item--parent">
        {item.icon && <span className="dropdown__icon">{item.icon}</span>}
        <span className="dropdown__label">{item.label}</span>
        <span className="dropdown__chevron">›</span>
      </div>
      {open && subPos && (
        <div
          className="dropdown-menu dropdown-menu--sub"
          style={{ position: 'fixed', top: subPos.top, left: subPos.left }}
        >
          {item.children!.map((child, i) => {
            if (child === ('separator' as unknown)) {
              return <div key={`sep-${i}`} className="dropdown__separator" />;
            }
            return (
              <button
                key={child.key}
                className="dropdown__item"
                onClick={child.onClick}
                disabled={child.disabled}
              >
                {child.icon && <span className="dropdown__icon">{child.icon}</span>}
                <span className="dropdown__label">{child.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
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
}

export type { MenuItem, MenuEntry };
