/* @layer renderer-components @kind component */
﻿import { Box } from '../../primitives/Box';
import { Icon } from '../../primitives/Icon';
import { IconButton } from '../../primitives/IconButton';
import './FullScreenLayer.css';
import { CLOSE_ICON_PATHS } from './FullScreenLayer.constants';
import { type FullScreenLayerProps } from './FullScreenLayer.type';

const FullScreenLayer = (props: FullScreenLayerProps) => {
  const { children, onClose, hidden } = props;

  return (
    <Box className="fullscreen-layer" style={hidden ? { display: 'none' } : undefined}>
      <Box className="fullscreen-layer__card">
        <Box className="fullscreen-layer__close">
          <IconButton variant="ghost" size="md" label="Close" onClick={onClose}>
            <Icon paths={CLOSE_ICON_PATHS} size={14} viewBox="0 0 14 14" />
          </IconButton>
        </Box>
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
