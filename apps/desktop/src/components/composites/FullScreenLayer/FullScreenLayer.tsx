import { useEffect, type ReactNode } from 'react';
import { IconButton } from '../../primitives/IconButton';
import './FullScreenLayer.css';

interface FullScreenLayerProps {
  children: ReactNode;
  onClose: () => void;
}

export function FullScreenLayer({ children, onClose }: FullScreenLayerProps): JSX.Element {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fullscreen-layer">
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
  );
}
