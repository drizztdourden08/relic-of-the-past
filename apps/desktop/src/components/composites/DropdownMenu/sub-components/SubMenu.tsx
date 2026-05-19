import { useRef, useState } from 'react';
import type { MenuItem } from '../types';

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
};

export { SubMenu };
export type { SubMenuProps };
