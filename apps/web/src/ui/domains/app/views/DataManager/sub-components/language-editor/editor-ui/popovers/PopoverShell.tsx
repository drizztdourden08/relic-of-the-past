/* @layer renderer-components @kind component */
/**
 * The card every toolbar popover is drawn in: anchored under its own button,
 * one column, narrow enough to read at a glance.
 *
 * It floats over what follows instead of growing the toolbar, because a toolbar
 * that changes height while being used moves the text away from the pointer. The
 * button that opened it is the anchor, so the card travels with the row for free
 * and needs no portal.
 *
 * `keepFocus` decides whether a press inside the card is allowed to move focus.
 * A card holding only buttons swallows mousedown, which keeps the caret alive in
 * the text the insert is aimed at; a card holding a field or a picker must not,
 * or the field could never be typed in. Either way the insert lands correctly:
 * the editor restores its own stored selection before placing a token.
 *
 * Purely presentational, dismissal included. The toolbar owns which card is
 * open and every way of closing it, because that is the element a press or an
 * Escape actually reaches.
 */
import { useCallback } from 'react';
import { Box } from '@ds/primitives';
import type { MouseEvent, ReactNode } from 'react';
import './PopoverShell.css';

type PopoverShellProps = {
  /** Accessible name, taken from the button that opened it. */
  label: string;
  /** Which edge the card lines up with. `end` keeps a right-hand button on screen. */
  align?: 'start' | 'end';
  /** True to swallow mousedown, so the caret in the text survives a press. */
  keepFocus?: boolean;
  children: ReactNode;
};

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
export type { PopoverShellProps };
