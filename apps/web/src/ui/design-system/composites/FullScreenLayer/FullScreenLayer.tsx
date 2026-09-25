/* @layer renderer-components @kind component */
/**
 * A whole-window page with a title bar and a close button.
 *
 * IT NOW OWNS ITS OWN `Escape`, at the OUTER-most dismiss level. It used to own
 * nothing: the app shell's global shortcut closed whatever page was open, which
 * meant a popover or a dialog opened inside a layer was competing with a
 * listener bound long before it existed, and the layer usually won. One press
 * threw away the whole editor instead of closing the picker in front of it.
 * Registering at `layer` puts it underneath every other dismissible surface, so
 * it is reached only once nothing is left above it.
 *
 * A hidden layer registers nothing. `ProfileHub` stays mounted with
 * `hidden` so its scroll position survives, and a page nobody can see must not
 * be what `Escape` closes.
 */
import { Box } from '../../primitives/Box';
import { useDismissable } from '../../primitives/Portal';
import { WindowHeader } from '../WindowHeader';
import './FullScreenLayer.css';
import { type FullScreenLayerProps } from './FullScreenLayer.type';

const FullScreenLayer = (props: FullScreenLayerProps) => {
  const { children, onClose, hidden, title, subtitle, extra, floating } = props;

  useDismissable({ active: !hidden, level: 'layer', onDismiss: onClose });

  return (
    <Box className="fullscreen-layer" style={hidden ? { display: 'none' } : undefined}>
      {/* The frame sizes the card and carries the floating slot, which overhangs the card's
          top edge; the card itself clips its content, so the slot cannot live inside it. */}
      <Box className="fullscreen-layer__frame">
        <Box className="fullscreen-layer__card">
          <WindowHeader title={title} subtitle={subtitle} extra={extra} onClose={onClose} className="fullscreen-layer__header" />
          <Box className="fullscreen-layer__content">
            {children}
          </Box>
        </Box>
        {floating && <Box className="fullscreen-layer__floating">{floating}</Box>}
      </Box>
    </Box>
  );
};

export {
  FullScreenLayer,
};
