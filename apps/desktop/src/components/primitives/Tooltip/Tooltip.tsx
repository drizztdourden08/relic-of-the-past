/* @layer renderer-components @kind component */
import { useLayoutEffect, useRef, useState } from 'react';
import { Portal } from '../Portal';
import './Tooltip.css';
import type { TooltipProps } from './types';

const Tooltip = (props: TooltipProps) => {
  const { content, placement = 'top', children, className = '' } = props;
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ left: r.left + r.width / 2, top: placement === 'top' ? r.top : r.bottom });
  }, [open, placement]);

  return (
    <span
      ref={anchorRef}
      className={`tooltip-anchor${className ? ` ${className}` : ''}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open && content != null && pos && (
        <Portal layer="tooltip">
          <div className="tooltip" data-placement={placement} style={{ left: pos.left, top: pos.top }}>
            {content}
          </div>
        </Portal>
      )}
    </span>
  );
};

export { Tooltip };
