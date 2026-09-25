/* @layer renderer-components @kind component */
/**
 * A sliding sheet (scrim + panel) anchored to a screen edge. Touch chrome uses it.
 *
 * IT IS ALWAYS MOUNTED, and closed only by `aria-hidden` plus a transform. A
 * drawer that unmounted would lose its scroll position and its transition every
 * time it was opened. That is why the `Escape` registration is gated on `open`
 * instead of on being rendered: A CLOSED DRAWER MUST CLAIM NOTHING, or the key
 * would be swallowed by a sheet nobody can see.
 *
 * §33.8 FILED THIS AND IT IS CROSSED OFF HERE. `Drawer` bound no key at all, so
 * a press over an open drawer reached whatever was behind it, such as the page or the
 * app shell's own shortcut. It registers on the dismiss stack at `dialog`,
 * which is the level its own `role="dialog" aria-modal="true"` already claims,
 * and every question of ordering is then §33's to answer, not this
 * component's: a popover opened inside the drawer outranks it, and a live drag
 * outranks both. That last pair is why it had to be closed now. A drag begun
 * with the touch chrome open is a plausible gesture, and it must be the drag
 * that `Escape` reaches.
 */
import { Box } from '../../primitives/Box';
import { useDismissable } from '../../primitives/Portal';
import './Drawer.css';
import type { DrawerProps } from './Drawer.type';

const Drawer = (props: DrawerProps) => {
  const { open, onClose, side = 'right', label, children } = props;

  useDismissable({ active: open, level: 'dialog', onDismiss: onClose });

  return (
    <Box className={`drawer drawer--${side}${open ? ' drawer--open' : ''}`} aria-hidden={!open}>
      <Box className="drawer__scrim" onClick={onClose} />
      <Box className="drawer__panel" role="dialog" aria-modal="true" aria-label={label}>
        {children}
      </Box>
    </Box>
  );
};

export { Drawer };
