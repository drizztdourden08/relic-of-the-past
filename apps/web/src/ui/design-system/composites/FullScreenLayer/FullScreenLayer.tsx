/* @layer renderer-components @kind component */
import { Box } from '../../primitives/Box';
import { WindowHeader } from '../WindowHeader';
import './FullScreenLayer.css';
import { type FullScreenLayerProps } from './FullScreenLayer.type';

const FullScreenLayer = (props: FullScreenLayerProps) => {
  const { children, onClose, hidden, title, subtitle, extra, floating } = props;

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
