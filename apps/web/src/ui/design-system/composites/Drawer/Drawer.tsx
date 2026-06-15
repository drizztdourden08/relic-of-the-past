/* @layer renderer-components @kind component */
import { Box } from '../../primitives/Box';
import './Drawer.css';
import type { DrawerProps } from './Drawer.type';

/** A sliding sheet (scrim + panel) anchored to a screen edge. Touch chrome uses it. */
const Drawer = (props: DrawerProps) => {
  const { open, onClose, side = 'right', label, children } = props;

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
