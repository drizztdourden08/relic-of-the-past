/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box } from '@ds/primitives';
import type { MouseEvent } from 'react';
import type { PopoverShellProps } from './PopoverShell.type';
import './PopoverShell.css';

const PopoverShell = (props: PopoverShellProps) => {
  const { label, align = 'start', keepFocus = false, children } = props;

  const handleMouseDown = useCallback((event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
  }, []);

  return (
    <Box
      className={`popover-shell popover-shell--${align}`}
      role="dialog"
      aria-label={label}
      onMouseDown={keepFocus ? handleMouseDown : undefined}
    >
      {children}
    </Box>
  );
};

export { PopoverShell };
