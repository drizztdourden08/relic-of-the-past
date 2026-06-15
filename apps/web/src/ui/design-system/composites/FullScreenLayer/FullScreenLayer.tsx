/* @layer renderer-components @kind component */
import { Box } from '../../primitives/Box';
import { WindowHeader } from '../WindowHeader';
import './FullScreenLayer.css';
import { type FullScreenLayerProps } from './FullScreenLayer.type';

const FullScreenLayer = (props: FullScreenLayerProps) => {
  const { children, onClose, hidden, title } = props;

  return (
    <Box className="fullscreen-layer" style={hidden ? { display: 'none' } : undefined}>
      <Box className="fullscreen-layer__card">
        <WindowHeader title={title} onClose={onClose} className="fullscreen-layer__header" />
        <Box className="fullscreen-layer__content">
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export {
  FullScreenLayer,
};
