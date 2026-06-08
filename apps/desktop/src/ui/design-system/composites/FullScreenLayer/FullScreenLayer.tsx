/* @layer renderer-components @kind component */
﻿import { IconButton } from '../../primitives/IconButton';
import './FullScreenLayer.css';
import { type FullScreenLayerProps } from './FullScreenLayer.type';


const FullScreenLayer = (props: FullScreenLayerProps) => {
  const { children, onClose, hidden } = props;

  return (
    <div className="fullscreen-layer" style={hidden ? { display: 'none' } : undefined}>
      <div className="fullscreen-layer__card">
        <div className="fullscreen-layer__close">
          <IconButton variant="ghost" size="md" label="Close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M1.5 0.5L7 6L12.5 0.5L13.5 1.5L8 7L13.5 12.5L12.5 13.5L7 8L1.5 13.5L0.5 12.5L6 7L0.5 1.5Z" />
            </svg>
          </IconButton>
        </div>
        <div className="fullscreen-layer__content">
          {children}
        </div>
      </div>
    </div>
  );
};

export {
  FullScreenLayer,
};
